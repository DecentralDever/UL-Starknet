import { Account, RpcProvider, ec, hash, CallData } from 'npm:starknet@5.24.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const RPC_URL = Deno.env.get('STARKNET_RPC_URL') || 'https://starknet-sepolia.public.blastapi.io';
const PAYMASTER_ADDRESS = Deno.env.get('PAYMASTER_ADDRESS');
const PAYMASTER_PRIVATE_KEY = Deno.env.get('PAYMASTER_PRIVATE_KEY');
const ARGENTX_ACCOUNT_CLASS_HASH = '0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f';

const provider = new RpcProvider({ nodeUrl: RPC_URL });

interface DeployAccountRequest {
  privateKey: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    if (!PAYMASTER_ADDRESS || !PAYMASTER_PRIVATE_KEY) {
      throw new Error('Paymaster not configured. Please set PAYMASTER_ADDRESS and PAYMASTER_PRIVATE_KEY environment variables.');
    }

    const { privateKey }: DeployAccountRequest = await req.json();

    if (!privateKey) {
      throw new Error('Private key is required');
    }

    const publicKey = ec.starkCurve.getStarkKey(privateKey);

    const constructorCalldata = CallData.compile({
      owner: publicKey,
      guardian: '0x0',
    });

    const accountAddress = hash.calculateContractAddressFromHash(
      publicKey,
      ARGENTX_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      0
    );

    const isDeployed = await checkIfDeployed(accountAddress);
    if (isDeployed) {
      return new Response(
        JSON.stringify({
          success: true,
          accountAddress,
          alreadyDeployed: true,
          message: 'Account already deployed',
        }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const paymaster = new Account(provider, PAYMASTER_ADDRESS, PAYMASTER_PRIVATE_KEY);
    const userAccount = new Account(provider, accountAddress, privateKey);

    const { transaction_hash } = await userAccount.deployAccount({
      classHash: ARGENTX_ACCOUNT_CLASS_HASH,
      constructorCalldata,
      addressSalt: publicKey,
    });

    await provider.waitForTransaction(transaction_hash);

    return new Response(
      JSON.stringify({
        success: true,
        accountAddress,
        txHash: transaction_hash,
        message: 'Account deployed successfully',
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error deploying account:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to deploy account',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function checkIfDeployed(address: string): Promise<boolean> {
  try {
    const code = await provider.getClassHashAt(address);
    return code !== '0x0';
  } catch (error) {
    return false;
  }
}

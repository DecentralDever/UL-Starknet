export interface CavosWallet {
  address: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface CavosSignUpResult {
  wallet: {
    address: string;
  };
  access_token: string;
  refresh_token?: string;
}

class CavosService {
  constructor() {}

  async createWalletWithAegis(aegisAccount: any, email: string, password: string): Promise<CavosWallet> {
    try {
      await aegisAccount.signUp(email, password);
      await new Promise(resolve => setTimeout(resolve, 500));

      const address = aegisAccount.address;

      if (!address) {
        throw new Error('No wallet address returned from Aegis signUp. The SDK may not be properly initialized.');
      }

      return {
        address,
      };
    } catch (error) {
      console.error('Aegis wallet creation failed:', error);
      throw error;
    }
  }

  async signInWithAegis(aegisAccount: any, email: string, password: string): Promise<CavosWallet> {
    try {
      await aegisAccount.signIn(email, password);

      const address = aegisAccount.address;
      if (!address) {
        throw new Error('No wallet address returned from Aegis');
      }

      return {
        address,
      };
    } catch (error) {
      console.error('Aegis sign in failed:', error);
      throw new Error(`Failed to sign in: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeTransactionWithAegis(
    aegisAccount: any,
    contractAddress: string,
    entrypoint: string,
    calldata: string[]
  ): Promise<{ txHash: string }> {
    try {
      const calls = [{
        contractAddress,
        entrypoint,
        calldata,
      }];

      const result = await aegisAccount.execute(calls);

      return {
        txHash: result.transaction_hash || result.txHash,
      };
    } catch (error) {
      console.error('Aegis transaction failed:', error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async executeBatchTransactionsWithAegis(
    aegisAccount: any,
    calls: Array<{
      contractAddress: string;
      entrypoint: string;
      calldata: string[];
    }>
  ): Promise<{ txHash: string }> {
    try {
      const result = await aegisAccount.execute(calls);

      return {
        txHash: result.transaction_hash || result.txHash,
      };
    } catch (error) {
      console.error('Aegis batch transaction failed:', error);
      throw new Error(`Batch transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const cavosService = new CavosService();

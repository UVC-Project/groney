export class TokenBlacklist {
    private static blacklist = new Set<string>();

    /**
     * It adds a token to a list
     * @param token 
     */
    static add(token: string) {
        this.blacklist.add(token);
    }

    /**
     * Checks if token already exist
     * @param token 
     * @returns string
     */
    static has(token: string): boolean {
        return this.blacklist.has(token);
    }
}

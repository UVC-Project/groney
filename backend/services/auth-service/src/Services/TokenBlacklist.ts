export class TokenBlacklist {
    private static blacklist = new Set<string>();

    /**
     * Add a token to the blacklist
     */
    static add(token: string) {
        this.blacklist.add(token);
    }

    /**
     * Check if a token is blacklisted
     */
    static has(token: string): boolean {
        return this.blacklist.has(token);
    }
}

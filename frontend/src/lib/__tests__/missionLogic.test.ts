import { describe, it, expect } from 'vitest';
import {getMissionAction} from "../../routes/map/+page.svelte"

describe('Real Mission Logic Tests', () => {

    it('✅ Should ALLOW submission if no submission ID exists', () => {
        // The function looks for 'myPendingSubmissionId'
        const result = getMissionAction({ 
            missionStatus: 'my_active', 
            myPendingSubmissionId: null,
            mySubmissionHasPhoto: false
        });
        
        expect(result.action).toBe('submit');
        expect(result.disabled).toBe(false);
    });

    it('✅ Should ALLOW submission if ID exists (Draft) but HasPhoto is FALSE', () => {
        // This simulates: ID is present, but no photo uploaded yet
        const result = getMissionAction({ 
            missionStatus: 'my_active',
            myPendingSubmissionId: '123', 
            mySubmissionHasPhoto: false
        });

        expect(result.action).toBe('submit');
        expect(result.disabled).toBe(false);
    });

    it('⛔ Should BLOCK submission if ID exists AND HasPhoto is TRUE', () => {
        // This simulates: ID present AND photo uploaded
        const result = getMissionAction({ 
            missionStatus: 'my_active',
            myPendingSubmissionId: '123', 
            mySubmissionHasPhoto: true
        });

        expect(result.action).toBe('none');
        expect(result.disabled).toBe(true);
        expect(result.label).toBe('⏳ Under Review');
    });

    // Added to verify standard cases still work
    it('✅ Should handle Available status', () => {
        const result = getMissionAction({ missionStatus: 'available' });
        expect(result.action).toBe('accept');
    });
});
import { TestBed, async } from '@angular/core/testing';
import { ContextService } from './context.service';
import { POLICY_LEVEL, POLICY_FLOW } from './constants';
import { APP_CONSTANT } from '../../app/app.constant';

describe('context-service initialized', () => {
    let contextService: ContextService;
    beforeEach(async(() => {
        window['CONFIG'] = {
            tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
            apiUrl: APP_CONSTANT.config.apiUrl
        };
        TestBed.configureTestingModule({
            providers: [ContextService]
        });
        contextService = TestBed.get(ContextService);
    }));
    /**
     * expect policy level defined by calling set function
     */
    it('policy level to be defined', () => {
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        expect(contextService.policyLevel).toBe(POLICY_LEVEL.PROPERTY);
    });

    it('policy flow to be defined', () => {
        contextService.setPolicyFlow(POLICY_FLOW.SEARCH);
        expect(contextService.policyFlow).toBe(POLICY_FLOW.SEARCH);
    });

    it('should set policy flow value', () => {
        contextService.setPolicyFlowValue(POLICY_FLOW.SEARCH);
        expect(contextService.policyFlowValue).toBe(POLICY_FLOW.SEARCH);
    });

    it('should get policy flow value', () => {
        contextService.setPolicyFlowValue(POLICY_FLOW.SEARCH);
        expect(contextService.getPolicyFlowValue()).toBe(POLICY_FLOW.SEARCH);
    });

    it('should get user permissions', () => {
        expect(contextService.getUserPermission()).toBe('3');
    });

    it('should set ChainCode value', () => {
        contextService.setChainCode('ChainCode');
        expect(contextService.chainCode).toBe('ChainCode');
    });

    it('should get ChainCode value', () => {
        contextService.chainCode = 'ChainCode';
        expect(contextService.getChainCode()).toBe('ChainCode');
    });
});

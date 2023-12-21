import { TestBed, async, inject } from '@angular/core/testing';
import { RouteStateService } from './route.state.service';
import { Router, NavigationEnd, RouterEvent, ActivatedRoute } from '@angular/router';
import { of, ReplaySubject } from 'rxjs';
import { ContextService } from './context.service';
import { POLICY_FLOW, POLICY_LEVEL, POLICY_TYPE, CONFIG_TYPE } from './constants';
import { from } from 'rxjs/internal/observable/from';

const eventSubject = new ReplaySubject<RouterEvent>();
const routerMock = {
    navigate: jasmine.createSpy('navigate'),
    events: eventSubject.asObservable(),
    url: '/policy-mgmt/property/search/policy'
};

/**
 * SPY for TCTranslate service
 */
const spyContextService = jasmine.createSpyObj('ConTextService',
    ['setPolicyLevel', 'setPolicyFlow', 'setPolicyConfigType', 'setPolicyType', 'setRatePlanId', 'setPolicyFlowValue', 'setChainCode']);

describe('Route State Service', () => {
    let routeStateService: RouteStateService;
    let contextService: ContextService;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: Router,
                    useValue: routerMock
                },
                {
                    provide: ContextService,
                    useValue: spyContextService
                },
                {
                    provide: ActivatedRoute,
                    useValue: { queryParams: from([{ ratePlanId: null }]) }
                },
                RouteStateService,
                ContextService
            ]
        });
        routeStateService = TestBed.inject(RouteStateService);
        contextService = TestBed.inject(ContextService);
    }));

    it('setting application context for enterprise', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        spyOn<ContextService, any>(contextService, 'setPolicyLevel').and.callThrough();
        spyOn<ContextService, any>(contextService, 'setChainCode').and.callThrough();
        spyOn<ContextService, any>(contextService, 'setPolicyFlow').and.callThrough();
        spyOn<ContextService, any>(contextService, 'setPolicyFlowValue').and.callThrough();
        spyOn<ContextService, any>(contextService, 'setPolicyConfigType').and.callThrough();
        spyOn<ContextService, any>(contextService, 'setPolicyType').and.callThrough();

        // Act
        eventSubject.next(new NavigationEnd(1, '/policy-mgmt', '/policy-mgmt/enterprise/BLC/search/policy/cancellation'));

        // Assert
        expect(contextService.setPolicyLevel).toHaveBeenCalled();
        expect(contextService.setChainCode).toHaveBeenCalled();
        expect(contextService.setPolicyFlow).toHaveBeenCalled();
        expect(contextService.setPolicyFlowValue).toHaveBeenCalled();
        expect(contextService.setPolicyConfigType).toHaveBeenCalled();
        expect(contextService.setPolicyType).toHaveBeenCalled();
    });

    it('setting application context for property', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        spyOn<ContextService, any>(contextService, 'setPolicyLevel').and.callThrough();
        spyOn<ContextService, any>(contextService, 'setPolicyFlow').and.callThrough();
        spyOn<ContextService, any>(contextService, 'setPolicyFlowValue').and.callThrough();
        spyOn<ContextService, any>(contextService, 'setPolicyConfigType').and.callThrough();
        spyOn<ContextService, any>(contextService, 'setPolicyType').and.callThrough();

        // Act
        eventSubject.next(new NavigationEnd(1, '/policy-mgmt', '/policy-mgmt/property/search/policy/cancellation'));

        // Assert
        expect(contextService.setPolicyLevel).toHaveBeenCalled();
        expect(contextService.setPolicyFlow).toHaveBeenCalled();
        expect(contextService.setPolicyFlowValue).toHaveBeenCalled();
        expect(contextService.setPolicyConfigType).toHaveBeenCalled();
        expect(contextService.setPolicyType).toHaveBeenCalled();
    });

    it('should return the correct navigate route url when SEARCH DEPOSIT CONFIGURATION', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
        contextService.setPolicyFlow(POLICY_FLOW.SEARCH);
        const path = 'search/payment-deposit-rule';
        const expectedUrl = `../../${path}`;

        // Act
        const result = routeStateService.getNavigateRouteUrl(path);

        // Assert
        expect(result).toEqual(expectedUrl);
    });

    it('should return the correct navigate route url when SEARCH TEMPLATE', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyConfigType(CONFIG_TYPE.TEMPLATE);
        contextService.setPolicyFlow(POLICY_FLOW.SEARCH);
        contextService.setPolicyType(POLICY_TYPE.CANCELLATION);
        const path = 'search/template';
        const expectedUrl = `../../../${path}/${POLICY_TYPE.CANCELLATION}`;

        // Act
        const result = routeStateService.getNavigateRouteUrl(path);

        // Assert
        expect(result).toEqual(expectedUrl);
    });

    it('should return the correct navigate route url when SEARCH POLICY', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.PROPERTY);
        contextService.setPolicyConfigType(CONFIG_TYPE.POLICY);
        contextService.setPolicyFlow(POLICY_FLOW.SEARCH);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        const path = 'search/policy';
        const expectedUrl = `../../../${path}/${POLICY_TYPE.DEPOSIT}`;

        // Act
        const result = routeStateService.getNavigateRouteUrl(path);

        // Assert
        expect(result).toEqual(expectedUrl);
    });

    it('should return the correct navigate route url when SEARCH TEMPLATE from deposit configuration', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
        contextService.setPolicyFlow(POLICY_FLOW.SEARCH);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        const path = 'search/template';
        const expectedUrl = `../../${path}/${POLICY_TYPE.DEPOSIT}`;

        // Act
        const result = routeStateService.getNavigateRouteUrl(path);

        // Assert
        expect(result).toEqual(expectedUrl);
    });

    it('should return the correct navigate route url when SEARCH POLICY from deposit configuration', () => {
        // Arrange
        contextService.setPolicyLevel(POLICY_LEVEL.ENTERPRISE);
        contextService.setPolicyConfigType(CONFIG_TYPE.DEPOSIT_CONFIGURATION);
        contextService.setPolicyFlow(POLICY_FLOW.SEARCH);
        contextService.setPolicyType(POLICY_TYPE.DEPOSIT);
        const path = 'search/policy';
        const expectedUrl = `../../${path}`;

        // Act
        const result = routeStateService.getNavigateRouteUrl(path);

        // Assert
        expect(result).toEqual(expectedUrl);
    });
});

// Angular imports
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

// Third party imports
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TcTranslateService } from 'tc-angular-services';

// App imports
import { PolicyMgmtUtilityService } from './utility.service';
import { APP_CONSTANT } from 'src/app/app.constant';
import { HTTPService } from './http.service';

/**
 *  AoT requires an exported function for factories
 */
export function HttpLoaderFactory(http: HttpClient) {
  /**
   * Update i18nUrl and set it for loading translations
   */

  let langApiUrl;
  langApiUrl = window['CONFIG']['apiUrl']
    .replace('{{api_module_context_path}}', 'i18n/v1')
    + 'apps/ent-policy-ui/locales/';
  return new TcTranslateService().loadTranslation(http, langApiUrl);
}

describe('Policy Mgmt Utility Service', () => {
  let tcTranslateService: TcTranslateService;
  let translateService: TranslateService;
  let utiltyService: PolicyMgmtUtilityService;

  window['CONFIG'] = {
    tokenDecodedData: APP_CONSTANT.config.tokenDecodedData,
    apiUrl: APP_CONSTANT.config.apiUrl
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderFactory,
            deps: [HttpClient]
          }
        })
      ],
      providers: [
        PolicyMgmtUtilityService,
        TranslateService,
        TcTranslateService,
        HTTPService
      ]
    });
    tcTranslateService = TestBed.inject(TcTranslateService);
    translateService = TestBed.inject(TranslateService);
    tcTranslateService.initTranslation(translateService);
    utiltyService = TestBed.inject(PolicyMgmtUtilityService);
  });

  describe('exportToCSV', () => {
    let mockLink;
    const exportData = [
      { USER_NAME: 'test"1"', OLD_VALUE: 'OLD 1', NEW_VALUE: 'NEW 1', START_DATE: '2000-01-01', END_DATE: '2000-01-02' },
      { USER_NAME: 'test"2"', OLD_VALUE: 'OLD 2', NEW_VALUE: 'NEW 2', START_DATE: '2000-01-01', END_DATE: '2000-01-02' }
    ];

    beforeEach(() => {
      mockLink = jasmine.createSpyObj('a', ['click']);
      spyOn(document, 'createElement').and.returnValue(mockLink);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');
    });

    it('should not create the download link if the array is empty', () => {
      // Act
      utiltyService.exportToCSV([], 'test.csv');

      // Assert
      expect(document.createElement).not.toHaveBeenCalled();
      expect(document.body.appendChild).not.toHaveBeenCalled();
      expect(document.body.removeChild).not.toHaveBeenCalled();
      expect(mockLink.click).not.toHaveBeenCalled();
    });

    it('should create the download link and click on it', () => {
      // Arrange
      const fileName = 'test.csv';

      // Act
      utiltyService.exportToCSV(exportData, fileName);

      // Assert
      expect(document.createElement).toHaveBeenCalledTimes(1);
      expect(document.createElement).toHaveBeenCalledWith('a');

      expect(document.body.appendChild).toHaveBeenCalledWith(mockLink);
      expect(document.body.removeChild).toHaveBeenCalledWith(mockLink);

      expect(mockLink.href).toContain('data:application/csv');
      expect(mockLink.download).toEqual(fileName);
      expect(mockLink.click).toHaveBeenCalled();
    });

    it('should compose correct csv data when translateHeaders is false', () => {
      // Arrange
      const applicationType = 'data:application/csv,';
      // eslint-disable-next-line max-len
      const csvData = '"USER_NAME","OLD_VALUE","NEW_VALUE","START_DATE","END_DATE"\r\n"test""1""","OLD 1","NEW 1","2000-01-01","2000-01-02"\r\n"test""2""","OLD 2","NEW 2","2000-01-01","2000-01-02"\r\n';
      const result = encodeURI(`${applicationType}${csvData}`);

      // Act
      utiltyService.exportToCSV(exportData, 'test.csv', false);

      // Assert
      expect(mockLink.href).toEqual(result);
    });

    it('should compose correct csv data when translateHeaders is true', done => {
      // Arrange
      const applicationType = 'data:application/csv,';
      // eslint-disable-next-line max-len
      const csvData = '"User Name","Old Value","New Value","Start Date","End Date"\r\n"test""1""","OLD 1","NEW 1","2000-01-01","2000-01-02"\r\n"test""2""","OLD 2","NEW 2","2000-01-01","2000-01-02"\r\n';
      const result = encodeURI(`${applicationType}${csvData}`);

      // wait unitl translation fetch is done
      translateService.get('USER_NAME').subscribe(() => {
        // Act
        utiltyService.exportToCSV(exportData, 'test.csv', true);

        // Assert
        expect(mockLink.href).toEqual(result);
        done();
      });
    });
  });
});
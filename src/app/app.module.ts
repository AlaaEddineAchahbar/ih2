import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { routing } from './app-routing';
import { AppComponent } from './app.component';
import { TcConfigService, TcHttpInterceptor, TcJwtService, TcHttpHandler, TcSessionService } from 'tc-angular-services';
import { APP_CONSTANT } from './app.constant';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

export function configServiceFactory(tcConfigService: TcConfigService): any {
  console.log('APP_CONSTANT', APP_CONSTANT);
  return () => tcConfigService.initConfig(
    APP_CONSTANT.config.apiUrl,
    APP_CONSTANT.config.tokenDecodedData
  );
}
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    NgbModule,
    NgbTooltipModule,
    HttpClientModule,
    routing
  ],
  providers: [
    TcConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: configServiceFactory,
      deps: [TcConfigService],
      multi: true
    },
    TcHttpHandler,
    TcJwtService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TcHttpInterceptor,
      multi: true
    },
    TcSessionService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { GameSetupComponent } from './components/game-setup/game-setup.component';
import { GameComponent } from './components/game/game.component';
import { ResultComponent } from './components/result/result.component';

const routes: Routes = [
  { path: '', component: WelcomeComponent },
  { path: 'setup', component: GameSetupComponent },
  { path: 'game', component: GameComponent },
  { path: 'result', component: ResultComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

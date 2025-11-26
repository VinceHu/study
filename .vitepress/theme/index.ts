import DefaultTheme from 'vitepress/theme'
import './custom.css'
import './styles/home.css'
import QuestionStats from './components/QuestionStats.vue'
import CategoryCards from './components/CategoryCards.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('QuestionStats', QuestionStats)
    app.component('CategoryCards', CategoryCards)
  }
}

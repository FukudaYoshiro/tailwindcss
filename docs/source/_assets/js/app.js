window.Vue = require('vue')

Vue.component('responsive-code-sample', require('./components/ResponsiveCodeSample.vue'))

const app = new Vue({
    el: '#app'
})

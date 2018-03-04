HomeController = RouteController.extend({
  onBeforeAction: function () {
    this.redirect('/overview');
  }
});
 
LoginController = RouteController.extend({
  onBeforeAction: function () {
    this.next();
  },
  onAfterAction: function(){
    
  }
});
 
OverviewController = RouteController.extend({
  onBeforeAction: function () {
    this.next();
  }
});
 
ReportsController = RouteController.extend({
  onBeforeAction: function () {
    this.next();
  }
});
 
Router.route('home', {
  path: '/'
});
 
Router.route('overview', {
  onBeforeAction:function(){
      Check_login();
       this.next();
  },
  layoutTemplate: 'overview',
  path: '/overview'
});
 
Router.route('login', {
onBeforeAction:function(){
      Check_login();
       this.next();
  },
  path: '/login'
});
 
function Check_login(){
    
    var NOW = Math.round(new Date().getTime()/1000.0)
    var lt_session = Session.get("login_IO")
    // si souris bouge pas > 60min
    
    if ((NOW-lt_session>3)||(lt_session==undefined)||Session.get("login_user")==undefined){
        Router.go('/login');
        Session.set("login_IO",0)
    }
}
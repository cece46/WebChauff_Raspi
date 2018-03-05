if (Meteor.isClient) {
 
 Meteor.startup(function () {
        Notifications.settings.animationSpeed = 500;
        _.extend(Notifications.defaultOptions, {
            timeout: 5000
        });
    });  
    
    Template.login.events({
        "submit .ng-valid": function (event) {
          // Prevent default browser form submit
            event.preventDefault();
            Router.go('home');
        }
    });
 
    Template.login.rendered = function(){
        $(".login-page").addClass("ng-enter");
        setTimeout(function(){
            $(".login-page").addClass("ng-enter-active");
        }, 300);
        setTimeout(function(){
            $(".login-page").removeClass("ng-enter");
            $(".login-page").removeClass("ng-enter-active");
        }, 600);
        
    };
    
    Template.login.events({
        
        'click  #btn_login': function(e){
             
            e.preventDefault();
            var login=document.getElementById('sai_login').value;
            login=login.replace(/\s+/g, '')
            var password=document.getElementById('sai_password').value;
            
            if ((login != '') && (password != '')) {
                
                 Meteor.call('FindLastLogin',login,password, function(error, result){
                    if (!error)
                    {
                        Session.set("last_login",result.toLocaleString('fr-FR', { timeZone: 'Europe/Paris'}));
                    }
                });

                
                Meteor.call('LoginWithBDD',login,password, function(error, result){

                    if ((result == false) || (result==undefined))
                        error=1;

                    if(error){

                        Notifications.error('Login ou mot de passe incorrect', 'Vous n\'êtes pas autorisé à vous connecter.');

                    } else {
                        
                       
                        Router.go('/overview');

                        Session.set("login_IO",Math.round(new Date().getTime()/1000.0))                        
                        Session.set("login_user",login)              

                        var d = new Date(Math.round(new Date().getTime()/1000.0) * 1000)
                        var datestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)+"@"+("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +d.getFullYear();  

                    }
                 })
            }
        }
    });
  
    Template.login_user.helpers({
        
        user: function(){
            return Session.get("login_user");
        },
        lastlogin : function() {
            return Session.get("last_login");
        }
    });
}
if(Meteor.isClient){
    
    // Variables globales
    var STATE_CHAUFFAGE="";
    var autodelog, autostatechauffage;
 
    // Préchargement de la valeur du arduino dès l'affichage de la page login
    Meteor.call("State_Chauffage", function(error, result){
        
        if(error){
            //console.log(error)
        } else {
            //console.log(">>"+result)
            Session.set("STATE_CHAUFFAGE",result)
        }
        
    });
    
    // Template création de la page overview
    Template.overview.rendered = function(){
        
        if(Session.get("animateChild")){
            $(".overview-page").addClass("ng-enter");
            setTimeout(function(){
                $(".overview-page").addClass("ng-enter-active");
            }, 300);
            setTimeout(function(){
                $(".overview-page").removeClass("ng-enter");
                $(".overview-page").removeClass("ng-enter-active");
            }, 600);
        }
        
        // déclenchement des timers
        autodelog=Meteor.setInterval(AutoDelog,5000);
        autostatechauffage=Meteor.setInterval(AutoStateChauffage,5000);
    };
    
    // Fonction d'auto délog
    function AutoDelog(){
        
        var NOW = Math.round(new Date().getTime()/1000.0)
        var lt_session = Session.get("login_IO")
        // si souris bouge pas > 60s
        if ((NOW-lt_session>60)||(lt_session==undefined)||Session.get("login_user")==undefined){
            Router.go('/login');
            Session.set("login_IO",0)
        }
        
    }
    
    // Fonction de récupération de l'état du arduino
    function AutoStateChauffage() {
        
        Meteor.call("State_Chauffage", function(error, result){
            if(error){
                console.log(error)
            } else {
                Session.set("STATE_CHAUFFAGE",result)
                //console.log("> state chauffage: "+result)
            }
         });
        
    }
 
    // Template de destruction des timers en autre
    Template.overview.destroyed = function() {
        
        Meteor.clearInterval(autodelog);
        Meteor.clearInterval(autostatechauffage);
        //console.log("destroy")
    };
    
    // Template de rafraichissement
    Template.state_chauffage.helpers({
        
        state_chauffage:function(){
            
            return Session.get("STATE_CHAUFFAGE");
        }
        
    });
 
    Template.overview.events({
        
        'click #btn_pilot': function(e){
    
            e.preventDefault();

            var d = new Date(Math.round(new Date().getTime()/1000.0) * 1000)
            var datestring = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2)+"@"+("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +d.getFullYear();   
            
            Meteor.call("PilotChauffage",Session.get("login_user"), function(error, result){
                
                if(error){
                    
                    Notification.error("Erreur durant la demande d'ouverture à "+datestring)
                    
                } else {
                
                    Notifications.success("Ouverture demandée à ",datestring+". <br>Info du boitier : "+result);                  
                }
            });
 
        },   
        
        'click #btn_logout' : function(evt){
            evt.preventDefault();
            Session.set("login_IO",0)
            Router.go('/login');
        }    
    
    });
 
}

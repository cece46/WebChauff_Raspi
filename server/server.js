import { Meteor } from 'meteor/meteor';

/***************************** Config  **************************/
var Future = Npm.require("fibers/future");
var exec = Npm.require("child_process").exec;
var CONFIG = require('./config.json'); //dossier server
var dbUser = CONFIG.dbUser;
var dbPassword = CONFIG.dbPassword;
var dbHost = CONFIG.dbHost;
var dbName = CONFIG.dbName;
var gpio_status=CONFIG.gpio_status;
var gpio_relais=CONFIG.gpio_relais;

var blogin=false;
var lastlogin="";

Meteor.startup(() => {
 
   Meteor.methods({
       
       LoginWithBDD : function(_login, _password) {

            blogin=false;
            RequeteMySQL("FindUser",_login,_password);
        
            var timeout=0
            while (blogin==false){
                Meteor._sleepForMs(100); 
                timeout =timeout+ 100;

                if (timeout==1000){
                    console.log("timeout")
                    break;
                }
            }

            return blogin;                
            /*
                

                Insert_in_MySQL("LOGIN",_login,retour)
                var timeout=0
                while (retour==''){
                    Meteor._sleepForMs(100); 
                    timeout =timeout+ 100;
                    if (timeout==1000){
                        //console.log("timeout")
                        break;
                    }
                }

                return retour;
            },
            */

        },
       
       FindLastLogin : function(_login, _password){
          
            lastlogin="";
            RequeteMySQL("LastLogin",_login,_password);
        
            var timeout=0
            while (lastlogin==""){
                Meteor._sleepForMs(100); 
                timeout =timeout+ 100;

                if (timeout==1000){
                    console.log("timeout")
                    break;
                }
            }

            return lastlogin;   
        },
  
       PilotChauffage: function(_login){
                   
            //Insert_in_MySQL("OPENPORTAL",_login,retour)
            this.unblock();
            var retour=false;
            var future=new Future();
            var command="gpio mode "+gpio_relais+" out";
            //var command="uname";

            exec(command,function(error,stdout,stderr){
                if(error){
                    retour=false;
                    console.log(error);
                    throw new Meteor.Error(500,command+" failed");
                }
                retour=true;
                //future.return(stdout.toString());
            });
           
            Meteor._sleepForMs(500);
            command="gpio mode "+gpio_relais+" in";

            exec(command,function(error,stdout,stderr){
                if(error){
                    retour=false;
                    console.log(error);
                    throw new Meteor.Error(500,command+" failed");
                }
                retour=true;
                future.return(stdout.toString());
            });
            
            //console.log("Pilotage!")
            return retour;
        },
        
       State_Chauffage : function(){

            this.unblock();
            
            var future=new Future();
            var command="gpio read "+gpio_status;
            //var command="uname -a";
            exec(command,function(error,stdout,stderr){
                if(error){
                  console.log(error);
                  throw new Meteor.Error(500,command+" failed");
                }
                future.return(stdout.toString());
            });
            //console.log("Etat entrée: "+parseInt(future.wait()))
            return parseInt(future.wait());
        }
       
    });
    
    function RequeteMySQL(_method,_login,_password){
        
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host     : dbHost,
            user     : dbUser,
            password : dbPassword,
            database : dbName,
        });    
        
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        var now = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
        
        if (_method == "FindUser") {
            
            var req = 'SELECT count(*) as RESPONSE FROM '+dbName+'.table_utilisateur WHERE user=\''+_login+'\' and pass=\''+_password+'\';';
            connection.query('SELECT 1', function (error, results, fields) {
            
                if (error) throw error;
                // connected!
                //console.log(req)
                //console.log('connected as id ' + connection.threadId);
                connection.query(req, function (error, results, fields) {

                    if (results=="" || results==undefined || results==null)
                        return false;
                    
                    if (error)
                        throw error;
                    else {
                        blogin=(results[0].RESPONSE)
                        if (blogin){
                                                     
                            //mettre à jour la date du log
                            req = 'UPDATE '+dbName+'.table_utilisateur SET dates=\''+now+'\' WHERE user=\''+_login+'\';';
                            connection.query(req);
                        }
                        
                    }
                      
                    connection.end(function(err) {
                        // The connection is terminated now
                        //console.log('Connection termined');   
                    });
                }) 
            });
        }
        
        if (_method == "LastLogin"){
            
            var req = 'SELECT dates as RESPONSE FROM '+dbName+'.table_utilisateur WHERE user=\''+_login+'\' and pass=\''+_password+'\';';
            connection.query('SELECT 1', function (error, results, fields) {
            
                if (error) throw error;
                // connected!
                //console.log(req)
                //console.log('connected as id ' + connection.threadId);    
                connection.query(req, function (error, results, fields) {
                
                    if (results=="" || results==undefined || results==null)
                        return false;
                    
                    if (error)
                        throw error;
                    else {
                        lastlogin = results[0].RESPONSE;
                    }
                    connection.end(function(err) {
                        // The connection is terminated now
                        //console.log('Connection termined');   
                    });
                });
                
            });   
        }
    }
    
    
    function Insert_in_MySQL(_method,_login,_retour){
        
        // insersion en bdd
        var mysql = require('mysql');
        var connection = mysql.createConnection({
            host     : dbHost,
            user     : dbUser,
            password : dbPassword,
            database : dbName,
            chain    : dbChain
        });    
        
        var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
        var now = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 19).replace('T', ' ');
        
        if (_method == "LOGIN") {
 
            var req = 'INSERT INTO \`'+dbName+'\`.`t_login` (`user_login`,`date_login`,`result_login`) VALUES (AES_ENCRYPT(\''+_login+'\',\''+dbChain+'\'),AES_ENCRYPT(\''+now+'\',\''+dbChain+'\'),AES_ENCRYPT(\''+_retour+'\',\''+dbChain+'\'));';
        }
        if (_method == "OPENPORTAL") {
            
            var req = 'INSERT INTO \`'+dbName+'\`.`t_open_portal` (`user_open`,`date_open`,`result_open`) VALUES (AES_ENCRYPT(\''+_login+'\',\''+dbChain+'\'),AES_ENCRYPT(\''+now+'\',\''+dbChain+'\'),AES_ENCRYPT(\''+_retour+'\',\''+dbChain+'\'));';
 
        }
        //console.log(req)
 
        connection.query('SELECT 1', function (error, results, fields) {
        if (error) throw error;
            // connected!
            //console.log('connected as id ' + connection.threadId);
            connection.query(req, function (error, results, fields) {
                     if (error) throw error;
                     connection.end(function(err) {
                         // The connection is terminated now
                         //console.log('Connection termined');
                     });
            })
 
        });
    }    
});

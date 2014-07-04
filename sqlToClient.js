//Notes: 'users2' table is still hard coded
//		need persistence for signin... redis? send username on connect?
//DOING THIS: need clientScript to actually parse the notificaions


//setup app
var express=require('express');
var http=require('http');
var app=express();
var server=http.createServer(app).listen(8080,'localhost');//process.env.PORT);
var io=require('socket.io').listen(server);
app.use(express.static(__dirname+'/public'));
app.get('*',function(request,response){
response.redirect('sqlToClient.html');
});
//setup trello connect
var request = require('request-json');
var trello = request.newClient('https://trello.com');// spose I should remove this url...

//setup db
var mysql = require('mysql');
var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'testdb'
});
db.connect(function(err){
    if (err) {console.log(err)}
    else {console.log("connected to testdb")}
});
//var username;
//var userToken;
var appKey = "618872adfeb66934035ef3c85a7f9744";
//var lastAddedNotificationId;//init to 19th notif as of 7/3/14
//var tableName// = username+'Notifications';


//function declarations

//main script
io.sockets.on('connection',function(client){
	//needs vars: username userToken lastAddedNotificationId ; and functions: refresh()

	//Appearently you don't define socket properties, just assign them, but if you did, this is where I'd declare: username, userToken, lani, tableName


	console.log('new client')
	client.on('signIn',function(usrname,usrToken){
		client.username = usrname
		client.tableName = client.username+'Notifications'

		console.log('username='+client.username+' and usrToken='+usrToken)
		
		db.query("SELECT * FROM users2 WHERE username='"+ client.username+"'",function(err,rows,fields){
		// summary: if new user setup a notif table for them and add them to userlist, also, lastAddedNotificationId is set here, requardless, call refresh
			//if signing up, userToken will be set here otherwise it will be set in the else statement
			
			if (rows[0]){//if user found, set vars and refresh
				console.log('returning user')
				client.userToken = rows[0].userToken
				client.lastAddedNotificationId= rows[0].lastAddedNotificationId
				//client.tableName = client.username+'Notifications'
				refresh(client)
			}else if(usrToken){//elseif usertoken passed in, init new user
				console.log('new user with token')
				client.userToken = usrToken
				//make new notiftable, init user vals in user table
				//client.tableName = client.username+'Notifications'
				db.query('CREATE TABLE '+client.tableName+' (id VARCHAR(30), unread VARCHAR(30), type VARCHAR(30), date VARCHAR(30), cardId VARCHAR(30), cardName VARCHAR(100), creatorId VARCHAR(30), creatorUsername VARCHAR(30))',function(){
					trello.get('https://api.trello.com/1/members/'+client.username+'/notifications?limit=20&key='+appKey+'&token='+client.userToken, function(error, res, body) {
						client.lastAddedNotificationId = body[body.length-1].id
						console.log('lani='+client.lastAddedNotificationId)
						db.query("INSERT INTO users2 SET ?", {username:client.username ,userId:'' ,userToken:client.userToken ,lastAddedNotificationId:client.lastAddedNotificationId },function(){
							refresh(client)	
						});//pass callback here to update client if connected
					})
				})
//!!! need to init lastAddedNotification Id

			}else{//else send alert to signup
				//if not signing up, userToken won't be passsed with 'signin' event, so we set it (and lani) here
				client.emit('signUpAlert')
			}
			console.log('userToken='+client.userToken+' and lani ='+client.lastAddedNotificationId)
		})

	})
})

//var newNotifications = [];
var rowToAdd={};
//var lastAddedNotificationId='539936d80d0a994406e41e92';//init to 19th notif as of 7/3/14
var notifReqMultiplier= 5;
var notifRequestLimit = notifReqMultiplier;
var lastAddedIsInList = false;

function refresh(client){
	console.log('refreshing')
	console.log('client passed to function: userToken='+client.userToken+' and lani ='+client.lastAddedNotificationId)

	//get data from trello
	trelloToDb(client)
	//!!! need to wait for trello to fill db before calling sync...
	//sync client to db
	//syncClientToDB(client)
}

function syncClientToDB(client){
	console.log('syncing client to db')
	db.query('SELECT * FROM '+client.tableName+' ORDER BY date DESC LIMIT 0,12',function(err,rows,fields){
		rows.forEach(function(notification){
			console.log(notification.id+'sent to client')
			client.emit('addNotification',notification)
		})
	})
}

//I may be able to skip this function and pass requestNotifi... straight to refresh
function trelloToDb(client){
	console.log('getting data from trello')
	db.query("SELECT lastAddedNotificationId FROM users2 WHERE username='"+client.username+"'",function(err,rows,fields){
		console.log(rows[0])
		if (!client.lastAddedNotificationId){ client.lastAddedNotificationId = rows[0].lastAddedNotificationId;}
		requestNotificationsFromTrello(client);
	});
}

function requestNotificationsFromTrello (client){//needs vars: username, notifReqLim, appKey, userToken, LANI, lastAddedIsInList,rowToAdd,tableName
	trello.get('https://api.trello.com/1/members/'+client.username+'/notifications?limit='+notifRequestLimit.toString()+'&key='+appKey+'&token='+client.userToken, function(err, res, body) {
		console.log('request made');

		for (var i = 0; i<body.length;i++){
			if (body[i].id == client.lastAddedNotificationId){
				lastAddedIsInList = true;
				console.log('last added is in list');
				//break;
			}
		}

		if (lastAddedIsInList == true){
			var pastLastAdded = false;
			for (var i = body.length-1;i>=0;i--){
				if (pastLastAdded == true){
					client.lastAddedNotificationId = body[i].id;
					console.log('trying to insert new data... last id:'+client.lastAddedNotificationId);
					//db.query('INSERT INTO notes (note) VALUES (?)', data.note)
					//rowToAdd = "'"+body[i].id+"','"+body[i].unread+"','"+body[i].type+"','"+body[i].date+"','"+body[i].data.card.name+"','"+body[i].data.card.id+"','"+body[i].idMemberCreator+"','"+body[i].memberCreator.username+"'";
					//db.query("INSERT INTO notifications1 * VALUES (?)", rowToAdd);//
					rowToAdd = {
						id:body[i].id,
						unread:body[i].unread,
						type:body[i].type,
						date:body[i].date,
						cardId:body[i].data.card.id,
						cardName:body[i].data.card.name,
						creatorId:body[i].idMemberCreator,
						creatorUsername:body[i].memberCreator.username
					}
					db.query("INSERT INTO "+client.tableName+" SET ?", rowToAdd,function(){
						db.query("UPDATE users2 SET lastAddedNotificationId='"+ client.lastAddedNotificationId+"' WHERE username='"+client.username+"'", function(){
							//if(i==0){syncClientToDB(client)}// i won't = 0 after callback
						});
					});//pass callback here to update client if connected
					
				}else{
					if (body[i].id == client.lastAddedNotificationId){pastLastAdded = true;};
				}
			}
			syncClientToDB(client)//!!!sketchy because it doesn't necessarily wait for notifications to load
		}

		if (lastAddedIsInList == false && notifRequestLimit<21){// will need to get rid of this and condition eventually
			notifRequestLimit *= 2;
			//call this trello request function here!!!
			requestNotificationsFromTrello(client);
		}
	});

	//notifRequestLimit *= 2;
}




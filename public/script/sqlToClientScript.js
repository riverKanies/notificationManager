var socket;
var userToken
var username;

$(document).ready(function(){

socket=io.connect('localhost');

socket.on('signUpAlert',function(){alert("You need to sign up first")})
socket.on('addNotification',function(notification){
	// make each notificationinto a div
	$('<b>'+notification.creatorUsername+':</b> '+notification.type+' with ID: '+notification.cardId+'<br/>Date: '+notification.date+'<br/>Body: '+notification.cardName+'<br/><br/>').insertBefore($('#conversation'));
})

$('#signIn').click(signIn)
$('#enterToken').click(signUp)
})

function signIn(){
	/*!!!//this is no good because if they have signed up, userToken will be null
	if (!userToken){alert("You need to signup first")}
	else{*/
	username=prompt("What is your Trello username?")
	socket.emit('signIn',username,userToken)

}
function signUp(){
	userToken=prompt("Paste token here:")
	signIn()
	$('loading...<br/>').insertBefore($('#conversation'));//is this working?
}

//I think connect is built in to express or http and is initiated when the client loads the html doc...
/*socket.on('connect',addUser);
socket.on('updateChat',proceesMessage);
socket.on('updateUsers',updateUserList);
$('#dataSend').click(sendMessage);*/
//***new

/*$('#data').keypress(processEnterPress);
});
function processEnterPress(e){
	//i think this sends the message if user presses enter while typing
if(e.which==13){
e.preventDefault();
$(this).blur();
$('#dataSend').focus().click();
}
}*/
//***new



/*//after connecting, the user is prompted to enter a name and that name is sent to the server...
function addUser(){
socket.emit('addUser',prompt('What\'s your name'));
}
// the data in the input field is sent as a string to the server for processing...
function sendMessage(){
var message=$('#data').val();
socket.emit('sendChat',message);
$('#data').val('');
$('#data').focus();
}
//the message is recieved from the server, then added to the conversation(html)
function proceesMessage(username,data){
$('<b>'+username+':</b>'+data+'<br/>').insertAfter($('#conversation'));
}
// the list of users is erased and remade for every user whenever a new user connects, this way all users see all other users
function updateUserList(userNames){
$('#users').empty();
//the userNames value isn't used because it is identical to the key
$.each(userNames,function(key,value){
$('#users').append('<div>'+key+'</div>');
})
}*/
var socket;
$(document).ready(function(){
socket=io.connect(window.location.hostname);
//I think connect is built in to express or http and is initiated when the client loads the html doc...
socket.on('connect',addUser);
socket.on('updateChat',proceesMessage);
socket.on('updateUsers',updateUserList);
$('#dataSend').click(sendMessage);
$('#data').keypress(processEnterPress);
});
function processEnterPress(e){
	//i think this sends the message if user presses enter while typing
if(e.which==13){
e.preventDefault();
$(this).blur();
$('#dataSend').focus().click();
}
}

//after connecting, the user is prompted to enter a name and that name is sent to the server...
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
}
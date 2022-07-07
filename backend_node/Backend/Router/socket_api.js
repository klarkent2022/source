// 소켓
var socket_module = require('socket.io');
let mysql = require('../DB/mysql_Controller');

var clients = {};
const { Users } = require('../Utils/users');
const users = new Users();

module.exports = function (server) {
    var io = socket_module(server);
    //소켓서버 처리부
    io.on('connection', function (socket) {

        //console.log("**Socket.IO Version: " + require('socket.io/package').version);
        //console.log("**Socket.IO Version: "+io.version);
        console.log(socket.id + " 접속 -> ",socket.conn.remoteAddress);

        socket.on('disconnect', clientDisconnect);

        socket.on("admin_socket community_create", createCommunityToAdmin);
        socket.on("admin_socket community_feedback_create", createCommunityFeedbackToAdmin);
        socket.on("admin_socket community_like", likeCommunityToAdmin);
        socket.on("admin_socket community_feedback_like", likeCommunityFeedbackToAdmin);
        socket.on("admin_socket community_read", readCommunityToAdmin);
        socket.on("admin_socket community_delete", deleteCommunityToAdmin);
        socket.on("admin_socket community_feedback_delete", deleteCommunityFeedbackToAdmin);
        socket.on("admin_socket community_send_fav", sendCommunityFavToAdmin);
        socket.on("admin_socket community_receive_fav", receiveCommunityFavToAdmin);

        socket.on("admin_socket party_create", createPartyToAdmin);
        socket.on("admin_socket party_join", joinPartyToAdmin);
        socket.on("admin_socket party_join_allow", allowJoinPartyToAdmin);


        socket.on("admin_socket dailycard_send_stars", sendstarsInDailyToAdmin);
        socket.on("admin_socket dailycard_send_fav", sendfavInDailyToAdmin);
        socket.on("admin_socket dailycard_receive_fav", receivefavInDailyToAdmin);
        socket.on("admin_socket open_address", openAddressToAdmin);









        

        socket.on("client_join",clientJoin);
        socket.on("user_socket send_chat",sendChatAdmin);
        socket.on("admin_socket send_chat",sendChatUser);

        socket.on("user_socket enter_room",sendRoomEnterAdmin);
        socket.on("user_socket out_room",sendRoomOutAdmin);
        socket.on("admin_socket show_toastr",showToastToUser);
        socket.on("admin_socket update_users",Send_User_Update);
        socket.on("admin_socket room_close",Send_Room_Close);
        socket.on("admin_socket send_new_data" , sendNewData);

        //핸들러들

        async function clientDisconnect(){
            console.log('client disconnected');
            // await mysql.delete("tbl_current_users",{socket_id:socket.id});
        }


        async function createCommunityToAdmin(data){
            io.sockets.emit("user_socket community_create",data);
        }

        async function createCommunityFeedbackToAdmin(data){
            io.sockets.emit("user_socket community_feedback_create",data);
        }

        async function likeCommunityToAdmin(data){
            io.sockets.emit("user_socket community_like",data);
        }

        async function likeCommunityFeedbackToAdmin(data){
            io.sockets.emit("user_socket community_feedback_like",data);
        }

        async function readCommunityToAdmin(data){
            console.log('read community');
            io.sockets.emit("user_socket community_read",data);
        }

        async function deleteCommunityToAdmin(data){
            io.sockets.emit("user_socket community_delete",data);
        }

        async function deleteCommunityFeedbackToAdmin(data){
            io.sockets.emit("user_socket community_feedback_delete",data);
        }

        async function sendCommunityFavToAdmin(data){
            io.sockets.emit("user_socket community_send_fav",data);
        }

        async function receiveCommunityFavToAdmin(data){
            io.sockets.emit("user_socket community_receive_fav",data);
        }



        async function createPartyToAdmin(data){
            io.sockets.emit("user_socket party_create",data);
        }

        async function joinPartyToAdmin(data){
            io.sockets.emit("user_socket party_join",data);
        }
        
        async function allowJoinPartyToAdmin(data){
            io.sockets.emit("user_socket party_join_allow",data);
        }

        
        async function sendstarsInDailyToAdmin(data){
            io.sockets.emit("user_socket dailycard_send_stars",data);
        }

        async function sendfavInDailyToAdmin(data){
            io.sockets.emit("user_socket dailycard_send_fav",data);
        }

        async function receivefavInDailyToAdmin(data){
            io.sockets.emit("user_socket dailycard_receive_fav",data);
        }

        async function openAddressToAdmin(data){
            io.sockets.emit("user_socket open_address",data);
        }

        





















        async function clientJoin(data){
            console.log('client joined ' + data);

            var user_id = data;
            mysql.updateOne("customers",{id:user_id}, {socket_id:socket.id});

            // var user_id = data;
            // var same_user = await mysql.findWhere("tbl_current_users",{user_id:user_id});

            // if(same_user.length == 0){
            //     mysql.insertOne("tbl_current_users",{user_id:user_id, socket_id:socket.id});
            // }else{
            //     mysql.updateOne("tbl_current_users",{user_id:user_id}, {socket_id:socket.id});
            // }
        }
        
        async function sendChatAdmin(data){

            console.log('send chat to admin');

            //TODO admin한테만 필터하는 기능잇어야 한다.
            io.sockets.emit("socket_admin send_chat",data);

            //채트보낸 유저에게 보내기
            let recv_user = await mysql.findOne('tbl_current_users',{user_id:data.user_id});
            if(recv_user){
                data.me = true;
                io.to(recv_user.socket_id).emit('socket_user send_chat',data);        
            }
        }
        async function sendChatUser(data){

            console.log('send chat to user');

            let recv_user = await mysql.findOne('tbl_current_users',{user_id:data.recv_id});
            if(recv_user){
                io.to(recv_user.socket_id).emit('socket_user send_chat',data);        
            }

            
            //채트보낸 어드민에게 보내기
            let admin = await mysql.findOne('tbl_current_users',{user_id:data.user_id});
            if(admin){
                data.me = true;
                io.to(admin.socket_id).emit('socket_admin send_chat',data);        
            }
        }

        async function Send_Room_Close(data){
            // let cur_room = await mysql.findOne("tbl_rooms",{id:data.room_id});
            //채트보낸 유저에게 보내기
            let user = await mysql.findOne('tbl_current_users',{user_id:data.user_id});
            if(user){
                io.to(user.socket_id).emit('socket_user room_close');     
            }

        }

        function sendRoomEnterAdmin(data){
            //TODO admin한테만 필터하는 기능잇어야 한다.
            io.sockets.emit("socket_admin roomchanged",data);
        }
        function sendRoomOutAdmin(data){
            //TODO admin한테만 필터하는 기능잇어야 한다.
            io.sockets.emit("socket_admin roomchanged",data);
            
        }


        async function showToastToUser(data){
            let recv_user = await mysql.findOne('tbl_current_users',{user_id:data.user_id});
            console.log(recv_user);
            if(recv_user){
                io.to(recv_user.socket_id).emit('socket_user show_toastr',data);        
            }
        }


        async function Send_User_Update(data){
            let recv_user = await mysql.findOne('tbl_current_users',{user_id:data.user_id});console.log(recv_user);
            if(recv_user){
                io.to(recv_user.socket_id).emit('socket_user user_info',data);        
            }
        }

        function sendNewData(data){
            //TODO admin한테만 필터하는 기능잇어야 한다.
            io.sockets.emit("socket_admin newdata",data);
        }

    });

    global.socketIO = io;


}


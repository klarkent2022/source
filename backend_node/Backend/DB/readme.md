= SELECT ========================================================
var obj = {
 email:"test02",
 role:"3"
}
mysql.select('tbl_users' , obj , function(err, result){
	console.log(result[0].name);

})


= INSERT ========================================================

var test_obj = {
	name:"create3",
	email:"test02",
	password:"test02",
	role:"3"
}

mysql.insert('tbl_users',test_obj,function(err, result){
})

= DELETE ========================================================

var obj = {
 email:"test02",
 role:"3"
}

mysql.delete('tbl_users' , obj , function(err, result){
})

= UPDATE ========================================================

var values = [
  { name: "asd1", email:"qqqqq",id: 1 },
  { name: "asd2", id: 2 }
];
mysql.update('tbl_users' , values , function(err, result){
})



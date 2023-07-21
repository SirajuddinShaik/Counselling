let editing=false;
const btn=document.querySelectorAll("button");
$(btn[0]).hide();
$("#cancel").hide();
$("input").attr("disabled",true);



function edit(){
    $("input").attr("disabled",false);
    $("#back").hide(500);
    $(btn[1]).hide(500);
    $(btn[0]).show(500);
    $("#cancel").show(500);
}
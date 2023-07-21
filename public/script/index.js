function modes(){
    if($("#selectOption").attr("value")!=""){
        $("#logbutton").attr("disabled",false);
        console.log("login");
    }
    else{
        $("#logbutton").attr("disabled",true);
    }
}
export function initCalculator(){
    const pipbutton = document.getElementById("pip-button");
    const minCalc = document.getElementById("main");
    let pipWindow = null;

    pipbutton.addEventListener("click", async () => {
        if (!("documentPictureInPicture" in window)) {
            alert("Document Picture-in-Picture is not supported in this browser.");
            return;
        }
        
        if (pipWindow) return;

        try {
            pipWindow = await window.documentPictureInPicture.requestWindow({
                width: 400,
                height: 600,
            });
            const stylesheets = document.querySelectorAll("style, link[rel='stylesheet']");
            stylesheets.forEach((sheet) =>{
                pipWindow.document.head.append(sheet.cloneNode(true));
            });

            pipWindow.document.body.append(minCalc);
            pipWindow.document.documentElement.style.overflowX = "hidden";
            pipWindow.document.body.style.backgroundColor = "gray";
            pipbutton.style.display = "none";
            
            pipWindow.addEventListener("pagehide", () => {
                const allElementsInPipWindow = pipWindow.document.body.children;
                window.document.body.append(...allElementsInPipWindow);
                pipbutton.style.display = "inline-block"; 
                
                pipWindow = null; 
            }, { once: true });

        } catch (error) {
            console.error("Failed to open PiP window:", error);
        }
    });

    const form =document.getElementById("calc_form");
    form.addEventListener("submit", (e) =>{
        e.preventDefault();
    })

    const output = document.getElementById("output");
    const operand_btns = document.querySelectorAll("button[data-type=operand]");
    const result = document.getElementById("result");
    let isNewInput = false;

    operand_btns.forEach((btn) =>{
        btn.addEventListener("click", (e) =>{

            if (isNewInput) {
                result.value = e.target.value; 
                isNewInput = false;            
            }

            else if(result.value == 0 ){
                result.value=e.target.value;
            }

            else if(result.value.includes(".")){
            result.value = result.value + "" + e.target.value.replace(".","");
            }
            else if(result.value.includes("root")){
            result.value = result.value + "" + e.target.value.replace("root","");
            }
            else if(result.value.includes("square")){
            result.value = result.value + "" + e.target.value.replace("square","");
            }
            else if(result.value.includes("1/x")){
            result.value = result.value + "" + e.target.value.replace("1/x","");
            }
            else if(output.value.includes("=")){
            output.value="";
            result.value = e.target.value;
            }
            
            else {
                result.value = result.value + "" + e.target.value;  
            }

            format(result);

            if (result.textContent.length < 10 ){ 
                    result.style.fontSize = '3rem';
            }
            
            else {
                result.style.fontSize = '1.8rem';
            }

            
        });
    });

    function format(result){
        var nStr = result.value + '';
        nStr = nStr.replace( /\,/g, "");
        let x = nStr.split( '.' );
        let x1 = x[0];
        let x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while ( rgx.test(x1) ) {
            x1 = x1.replace( rgx, '$1' + ',' + '$2' );
        }
        result.value = x1 + x2;
        }

    const operator_btns = document.querySelectorAll("button[data-type=operator]");

    operator_btns.forEach((btn) => {
        btn.addEventListener("click", (e) =>{
            
            const val= result.value.replace(/\,/g,"");
            
            switch(e.target.value){

            case "%":   
            result.value= parseFloat(val) / 100;
            break;
            
            case "invert":
            result.value = parseFloat(val) * -1;
            break;

            case "/":
            if(!output.value.includes('/')){
            output.value=val + "" + e.target.value ;
            isNewInput=true;
            }

            else if(!isNewInput){
            output.value=Number(output.value.replace("/","")) / Number(val);
            output.value=output.value + "/";
            result.value=output.value.replace("/","");
            isNewInput=true;
            }
           
            break;

            case "*":
            if(!output.value.includes('*')){
            output.value=val + "" + e.target.value;
            isNewInput=true;
            }
            else if (!isNewInput ){
            output.value=Number(output.value.replace("*","")) * Number(val);
            output.value=output.value + "*";
            result.value=output.value.replace("*","");
            isNewInput=true;
            }
           
                
            break;

            case "+":
            if(!output.value.includes('+')){
            output.value=val + "" + e.target.value;
            isNewInput = true;
            }
            else if(!isNewInput){
            output.value=Number(output.value.replace("+","")) + Number(val);
            output.value=output.value + "+";
            result.value=output.value.replace("+","");
            isNewInput = true;
            }
            
            break;
            
            case "-":
            if(!output.value.includes('-')){
            output.value=val + "" + e.target.value;
            isNewInput=true;
            }
            else if (!output.value.startsWith('-') && e.target.value == "-" && !isNewInput){
            output.value=Number(output.value.replace("-","")) - Number(val);
            output.value=output.value + "-";
            result.value=output.value.replace("-","");
            isNewInput=true;
            }
            else if(!isNewInput){
                let odd= true;
                output.value= output.value.replace(/\-/gi, (remove)=>{
                    odd = !odd;
                    return !odd ? remove : '';
                })
            console.log(output.value);
            output.value=Number(output.value) - Number(val);
            output.value=output.value + "-";
            result.value=output.value
            isNewInput=true;
            }
            break;
            }  
            
            

        });
    });


    const backspace = document.querySelector("[data-type=backspace]");
    backspace.addEventListener("click", (e)=>{
        const val=result.value.replace(/\,/g, "");

        if(val == 0 ||val.length <= 1 ){
        result.value =0;
        }
        else{
            result.value = val.slice(0,-1);
        }
        if (result.value.length < 10) { 
            result.style.fontSize = '3rem';
        } else {
            result.style.fontSize = '1.8rem';
        }
    });




    const Calculation = document.querySelector("#equal");
    Calculation.addEventListener("click", (e)=>{
        const val= result.value.replace(/\,/g,"");
        if(output.value.endsWith('+')){
            let add=Number(output.value.replace("+",""))+ Number(val);
            output.value= output.value+ "" + val + "=";
            result.value=add;      
        }
        else if(output.value.endsWith('-')){
            let subtract=Number(output.value.replace("-",""))- Number(val);
            output.value=output.value + val + "=";
            result.value=subtract;
        }
        else if(output.value.endsWith('*')){
            let multiply=Number(output.value.replace("*",""))* Number(val);
            output.value=output.value + val + "=";
            result.value=multiply;
        }
        else if(output.value.endsWith('/')){
            let divide=Number(output.value.replace("/",""))/ Number(val);
            output.value=output.value + val + "=";
            result.value=divide;
        } 
        else if(output.value.includes('+','=')){
            output.value=val + "+" + output.value.split("+")[1].split("=")[0]+ "=";
            if(output.value.includes('+')){
                let add=Number(val)+Number(output.value.split("+")[1].split("=")[0]);
                result.value=add;
            }
        }
        else if(!output.value.startsWith('-') && output.value.includes('-')){
            output.value=val + "-" + output.value.split("-")[1].split("=")[0]+ "=";
            if(output.value.includes('-')){
                let subtract=Number(val)-Number(output.value.split("-")[1].split("=")[0]);
                result.value=subtract;
                console.log(!output.value.startsWith('-') && output.value.includes('-'));
            }
            
        }

        else if(output.value.includes('*')){
            output.value=val + "*" + output.value.split("*")[1].split("=")[0]+ "=";
            if(output.value.includes('*')){
                let multiply=Number(val)*Number(output.value.split("*")[1].split("=")[0]);
                result.value=multiply;
            }
        }
        else if(output.value.includes('/')){
            output.value=val + "/" + output.value.split("/")[1].split("=")[0]+ "=";
            if(output.value.includes('/')){
                let divide=Number(val)/Number(output.value.split("/")[1].split("=")[0]);
                result.value=divide;
            }
            
        }

        else if(output.value.startsWith('-') ){
            output.value=val + "-" + output.value.split("-")[2].split("=")[0]+ "=";
            let subtract=Number(val)-Number(output.value.split("-")[2].split("=")[0]);
            result.value=subtract;
        
        }
    
        
    
    });

}


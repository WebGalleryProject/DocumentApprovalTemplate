const buttonStart = document.querySelector('.send');
const formUpload = document.querySelector('.form-upload');
let data;
let dataCopy;
let iter = 0;
let approveNum = 0;

function prepareData() {
    let fileName = document.querySelector('input[type=file]').value.split("\\");
    readUploadedFile(fileName[fileName.length-1], function(text){
        parser = new DOMParser();
        data = parser.parseFromString(text,"text/xml");
        dataCopy = data;
        console.log("Data :", data);
        startTest(formUpload, data, iter, dataCopy, approveNum)
    });
};

function readUploadedFile(file, callback)
{
if (window.XMLHttpRequest)
  {
    xmlhttp=new XMLHttpRequest();
  }
else
  {
    xmlhttp=new ActiveXObject("Microsoft.XMLHTTP");
  }
xmlhttp.onreadystatechange=function()
    {
      if (xmlhttp.readyState==4 && xmlhttp.status==200)
        { 
            callback(xmlhttp.responseText);
        }
    };
xmlhttp.open("GET", file, true);
xmlhttp.send();
}

function start (btn) {
    btn.addEventListener('click', event => {
        event.preventDefault();
        prepareData();
    });
};

function createNewForm(block, elem) {
    let user = elem.querySelector('user').innerHTML;
    block.innerHTML += `
    <form class="agreement">
        <span>${user}</span>
        <input class="yes" type="submit" value="Да"></input>
        <input class="no" type="submit" value="Нет"></input>
    </form>`
}


function isDisabled(btn) {
  return btn.disabled == true;
}

function checkOper(elem) {
    return elem;
}

function checkInn(elem) {
    return elem;
}

function changeDecision(obj, ans) {
    obj.innerHTML += ans;
    return obj.innerHTML;
}

function operationType(stepsTag, i) {
    let operation = stepsTag[i].querySelector('operation');
    if (!operation) {
        operation = 'none';
        return operation
    }
    else {
        return operation.innerHTML;
    }
}

function startTest(block, elem, i, newData, approve) {
    block.innerHTML = ``;
    const stepsTag = newData.getElementsByTagName('steps');

    if (i < stepsTag.length) {
        block.innerHTML += `<span>Операция: ${operationType(stepsTag, i)}</span>`;
        stepsTag[i].querySelectorAll('members').forEach(item => {
            createNewForm(block, item)
        })

        const btnYes = Array.from(document.querySelectorAll('.yes'));
        const btnNo = Array.from(document.querySelectorAll('.no'));


        btnYes.forEach((item, k) => {
            let currentMember = stepsTag[i].querySelectorAll('members')[k];
            let currentDecision = currentMember.querySelector('decision');
            item.addEventListener('click', () => {
                btnYes[k].disabled = true;
                btnNo[k].disabled = true;
                btnYes[k].classList.add('disabled')
                btnNo[k].classList.add('disabled')
                changeDecision(currentDecision, true)
                if (btnYes.every(isDisabled)) {
                    startTest(block, elem, ++i, newData)
                }
            })
        })


        btnNo.forEach((item, k) => {
            let currentMember = stepsTag[i].querySelectorAll('members')[k];
            let currentDecision = currentMember.querySelector('decision');
            item.addEventListener('click', () => {
                btnYes[k].disabled = true;
                btnNo[k].disabled = true;
                btnYes[k].classList.add('disabled')
                btnNo[k].classList.add('disabled')
                changeDecision(currentDecision, false)
                if (btnNo.every(isDisabled)) {
                    startTest(block, elem, ++i, newData)
                }
            })
        }) 
    } else {
        console.log(newData);
        toApprove(newData, approve)
    }
};

function downloadObjectAsJson(exportObj, exportName){
    var s = new XMLSerializer();
    var d = exportObj;
    var str = s.serializeToString(d);
    const dataStr = "data:text/xml;charset=utf-8," + encodeURIComponent(str);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".xml");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  }

function showResult(block, ans, trigger) {
    if (trigger) {
        block.innerHTML = `<div>
        <span  style="color: green; font-size: 24px">${ans}</span>
        <button class="download">Скачать</button>
        </div>`;
        document.querySelector('.download').addEventListener('click', () => {
            downloadObjectAsJson(dataCopy, "document")
        })
    } else {
        block.innerHTML = `<div>
        <span  style="color: red; font-size: 24px">${ans}</span>
        <button class="download">Скачать</button>
        </div>`;
        document.querySelector('.download').addEventListener('click', () => {
            downloadObjectAsJson(dataCopy, "document")
        })
    }
    
}

function strToBool(str) {
    if (str === "false") {
        str = false;
        return str;
    } else {
        str = true;
        return str;
    }
}

function toApprove(newData) {
    let checkArr = [];
    let steps = newData.querySelectorAll('steps');
    
    steps = Array.prototype.slice.call(steps);
    
    steps.forEach((item, i) => {
        let arr = [];
        let members = item.querySelectorAll('members');
        members = Array.prototype.slice.call(members);
        members.forEach(member => {
            const decision = member.querySelector('decision');
            arr.push(strToBool(decision.textContent));
        })
        
        let operation = item.querySelector('operation');
        operationType(steps, i);
        if (operation) {
            if (operation.innerHTML == "and") {
                if (arr.every(checkInn)) {
                    checkArr.push(true);
                } else {
                    checkArr.push(false);
                }
            }
            if (operation.innerHTML == "or") {
                if (arr.some(checkInn)) {
                    checkArr.push(true);
                } else {
                    checkArr.push(false);
                }
            }
        } else {
            if (arr.some(checkInn)) {
                checkArr.push(true);
            } else {
                checkArr.push(false);
            }
        }

    })
    if (checkArr.every(checkOper)) {
        approve = 1;
        showResult(formUpload, "Согласовано", true)
        
    } else {
        approve = 0;
        showResult(formUpload, "Не согласовано", false)
    }
}

start(buttonStart)
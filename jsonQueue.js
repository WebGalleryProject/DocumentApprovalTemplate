const buttonStart = document.querySelector('.send');
const formUpload = document.querySelector('.form-upload');
let data;
let dataCopy;
let iter = 0;
let approveNum = 0;

const readUploadedFile = () =>{
    const fileName = document.querySelector('input[type=file]').value.split("\\");
    const file = fileName[fileName.length-1];
    fetch(file)
    .then((file) => file.json())
    .then((file) => {
        data = JSON.parse(JSON.stringify(file))
        return data;
    })
    .then(dataCopy = data)
    .then()
    .then((dataCopy) => {
        startTest(formUpload, data, iter, dataCopy, approveNum);
    })
}

function start(btn) {
    btn.addEventListener('click', event => {
        event.preventDefault();
        readUploadedFile();
    });
};

function createNewForm(block, elem) {
    block.innerHTML += `
    <form class="agreement">
        <span>${elem.user}</span>
        <input class="yes btn" type="submit" value="Да"></input>
        <input class="no btn" type="submit" value="Нет"></input>
    </form>`
}

function isDisabled(btn) {
  return btn.disabled == true;
}

function checkOper(elem) {
    return elem;
}

function changeDecision(obj, ans) {
    obj.decision = ans;
    return obj;
}


function startTest(block, elem, i, newData, approve) {
    block.innerHTML = ``;

    if (i < newData.steps.length) {
        let operation = newData.steps[i].operation;

        if (operation === undefined) {
            operation = 'none';
        }

        block.innerHTML += `<span>Операция: ${operation}</span>`;
        newData.steps[i].members.forEach(item => {
            createNewForm(block, item)
        })

        const btnYes = Array.from(document.querySelectorAll('.yes'));
        const btnNo = Array.from(document.querySelectorAll('.no'));

        btnYes.forEach((item, k) => {
            item.addEventListener('click', () => {
                btnYes[k].disabled = true;
                btnNo[k].disabled = true;
                changeDecision(newData.steps[i].members[k], true)
                if (btnYes.every(isDisabled)) {
                    startTest(block, elem, ++i, newData)
                }
            })
        })

        btnNo.forEach((item, k) => {
            item.addEventListener('click', () => {
                btnYes[k].disabled = true;
                btnNo[k].disabled = true;   
                changeDecision(newData.steps[i].members[k], false)
                if (btnNo.every(isDisabled)) {
                    startTest(block, elem, ++i, newData)
                }
            })
        }) 

    } else {
        toApprove(newData, approve)
    }
};

function downloadObjectAsJson(exportObj, exportName){
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", exportName + ".json");
    document.body.appendChild(downloadAnchorNode);
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

function toApprove(newData) {
    let checkArr = [];

    newData.steps.forEach(item => {
        let arr = [];
        item.members.forEach(member => {
            arr.push(member.decision);
        })
        if (item.operation) {
            if (item.operation == "and") {
                if (arr.every(checkOper)) {
                    checkArr.push(true);
                } else {
                    checkArr.push(false);
                }
            }
            if (item.operation == "or") {
                if (arr.some(checkOper)) {
                    checkArr.push(true);
                } else {
                    checkArr.push(false);
                }
            }
        } else {
            if (arr.some(checkOper)) {
                checkArr.push(true);
            } else {
                checkArr.push(false);
            }
        }

    })
    if (checkArr .every(checkOper)) {
        approve = 1;
        showResult(formUpload, "Согласовано", true)
        
    } else {
        approve = 0;
        showResult(formUpload, "Не согласовано", false)
    }
}

start(buttonStart)
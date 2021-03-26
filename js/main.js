votersCount=0;
partiesList=[];
coalitionMandatesCount=0;

class Party {

    constructor(title, electionPercentage)
        {
        this.title=title;
        this.electionPercentage=electionPercentage;
        this.votesCount=0;
        this.mandatesCount=0;
        this.parliamentPercentage=0.0;
        this.divisionRemainder=0;

        //Count plusses and determine the number of subparties

        let plussesCount=0;
        for (let i=0;i<title.length;i++) {
            if (title[i]=="+") {
                plussesCount+=1;
                }
            }
        this.partiesCount=plussesCount+1;
        }
    }

window.addEventListener("load", function() {

    //Load control elements

    votersCountInputText=document.getElementById("votersCountInputText");
    partiesPercentagesTextArea=document.getElementById("partiesPercentagesTextArea");
    submitButton=document.getElementById("submitButton");

    partiesListForm=document.getElementById("partiesListForm");

    coalitionMandatesCountStrong=document.getElementById("coalitionMandatesCountStrong");

    //Subscribe events

    submitButton.addEventListener("click", submitButton_Click);
    });

function submitButton_Click() {
    //First of all, load input locally and check for its validity

    if (votersCountInputText.value=="") {
        alert("Chyba: Nezadali ste počet voličov.");
        return;
        }
    if (partiesPercentagesTextArea.value=="") {
        alert("Chyba: Nezadali ste jednotlivé strany a ich výsledky.");
        return;
        }

    if (isNaN(votersCountInputText.value)) {
        alert("Chyba: V políčku pre počet voličov ste nezadali platné číslo.");
        return;
        }

    let localVotersCount=parseInt(votersCountInputText.value);
    let localPartiesList=[];

    partiesPercentagesTextArea.value.replace(/%/g, "").replace(/,/g, ".").split("\n").forEach(function(i) {

        let parts=splitLine(i);

        if (parts.length==2) {
            let partyTitle=parts[0];
            let partyPercentage=parts[1].trim();

            if (partyTitle=="" || partyPercentage=="" || isNaN(partyPercentage)) {
                alert(`Chyba: Riadok "${i}" neplatný.`);
                return;
                }

            partyPercentage=parseFloat(partyPercentage);

            localPartiesList.push(new Party(partyTitle, partyPercentage));
            }
        });

    if (processPartiesList(localPartiesList, localVotersCount)==false) {
        alert("Chyba: Jednotlivé strany majú spolu viac než 100%.");
        return;
        }

    votersCount=localVotersCount;
    partiesList=localPartiesList;

    updatePartiesListForm();

    }
function processPartiesList(pList, vCount) {
    //First of all, check if the parties don't make more than 100%

    let percentageSum=0.0;

    pList.forEach(function(i) {
        percentageSum+=i.electionPercentage;
        });

    if (percentageSum>100) {
        return false;
        }

    //Remove parties under the limit

    for (let i=0;i<pList.length;i++) {
        currentParty=pList[i];
        if (currentParty.partiesCount==1 && currentParty.electionPercentage<5.0) {
            pList.splice(i, 1);
            i-=1;
            continue;
            }
        else if (currentParty.partiesCount>=2 && currentParty.partiesCount<=3 && currentParty.electionPercentage<7.0) {
            pList.splice(i, 1);
            i-=1;
            continue;
            }
        if (currentParty.partiesCount>=4 && currentParty.electionPercentage<10.0) {
            pList.splice(i, 1);
            i-=1;
            continue;
            }
        }

    //If no parties remained, print an error

    if (pList.length==0) {
        alert("Chyba: Nijaká strana nepresiahla volebný prah.");
        return false;
        }

    //Count and assign mandates

    let passedPartiesVotesSum=0;
    pList.forEach(function(i) {
        i.votesCount=Math.floor(i.electionPercentage/100*vCount);
        passedPartiesVotesSum+=i.votesCount;
        });

    let republicElectionNumber=Math.round(passedPartiesVotesSum/151);

    let assignedMandatesCount=0;
    pList.forEach(function(i) {
        i.mandatesCount=Math.floor(i.votesCount/republicElectionNumber);
        i.divisionRemainder=i.votesCount%republicElectionNumber
        assignedMandatesCount+=i.mandatesCount;
        });

    if (assignedMandatesCount>150) {
        let tempPartiesList=[...pList];
        tempPartiesList.sort(function(a, b) {
            if (b.divisionRemainder<a.divisionRemainder) {
                return 1;
                }
            else if (b.divisionRemainder>a.divisionRemainder) {
                return -1;
                }

            if (b.votesCount<a.votesCount) {
                return 1;
                }
            else if (b.votesCount>a.votesCount) {
                return -1;
                }

            return (random(0, 2)==1) ? 1: -1;
            });
        tempPartiesList[0].mandatesCount-=assignedMandatesCount-150;
        assignedMandatesCount=150;
        }
    else if (assignedMandatesCount<150) {
        let tempPartiesList=[...pList];
        tempPartiesList.sort(function(a, b) {
            if (b.divisionRemainder>a.divisionRemainder) {
                return 1;
                }
            else if (b.divisionRemainder<a.divisionRemainder) {
                return -1;
                }

            if (b.votesCount>a.votesCount) {
                return 1;
                }
            else if (b.votesCount<a.votesCount) {
                return -1;
                }

            return (random(0, 2)==1) ? 1: -1;
            });

        let i=0;
        for (;assignedMandatesCount<150;assignedMandatesCount++) {
            tempPartiesList[i].mandatesCount+=1;
            i+=1;
            i%=tempPartiesList.length;
            }
        }

    //Update parliament percentages

    pList.forEach(function(p) {
        p.parliamentPercentage=round(p.mandatesCount/150*100, 2);
        });

    return true;
    }

function updatePartiesListForm() {
    if (coalitionMandatesCount!=0) {
        coalitionMandatesCount=0;
        updateCoalitionMandatesCountStrong();
        }

    while (partiesListForm.childNodes.length>0) {
        partiesListForm.removeChild(partiesListForm.childNodes[0]);
        }

    for (let i=0;i<partiesList.length;i++) {
        createPartyCheckboxElements(partiesList[i], i).forEach(function(j) {
            partiesListForm.appendChild(j);
            });
        partiesListForm.appendChild(document.createElement("br"));
        }
    }
function createPartyCheckboxElements(party, index) {
    let checkboxId=`party${index}Checkbox`;

    let label=document.createElement("label");
    label.setAttribute("for", checkboxId);
    label.textContent=`${party.title}, ${party.mandatesCount} (${party.parliamentPercentage}%)`;

    let checkbox=document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("id", checkboxId);
    checkbox.addEventListener("click", partyCheckbox_Click);

    return [checkbox, label];
    }
function partyCheckbox_Click() {
    let id=this.getAttribute("id");
    let partyIndex=parseInt(id.substring(5, id.length-8));

    if (this.checked) {
        coalitionMandatesCount+=partiesList[partyIndex].mandatesCount;
        }
    else {
        coalitionMandatesCount-=partiesList[partyIndex].mandatesCount;
        }

    updateCoalitionMandatesCountStrong();
    }
function updateCoalitionMandatesCountStrong() {
    coalitionMandatesCountStrong.textContent=`${coalitionMandatesCount} kresiel (${round(coalitionMandatesCount/150*100, 2)}%)`;
    }

function splitLine(line) {
    //This function takes the most right : in a string and splits it by this mark to two parts.

    if (line.length==0) {
        return [line];
        }

    for (let i=line.length-1;i>=0;i--) {
        if (line[i]==":") {
            return [line.substring(0, i), line.substring(i+1, line.length)];
            }
        }

    return [line];
    }
function random(min, max) {
    return Math.floor(Math.random()*(max-min))+min;
    }
function round(x, decimals) {
    return Math.round((x+Number.EPSILON)*Math.pow(10, decimals))/Math.pow(10, decimals);
    }


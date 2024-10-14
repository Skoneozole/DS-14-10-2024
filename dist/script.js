function getValues() {
  const {
    inputMontant,
    inputTaux,
    inputAnnee
  } = window;
  let montant = Math.abs(inputMontant.valueAsNumber) || 0,
    annee = Math.abs(inputAnnee.valueAsNumber) || 0,
    mois = annee * 12 || 1,
    taux = Math.abs(inputTaux.valueAsNumber) || 0,
    tauxMensuel = taux / 100 / 12;
  return {
    montant,
    annee,
    mois,
    taux,
    tauxMensuel
  }
}

let calculMensualite = function(montant, tauxMensuel, mois) {
  let remboursementMensuel;
  if (tauxMensuel) {
    remboursementMensuel = montant * tauxMensuel /
      (1 - (Math.pow(1 / (1 + tauxMensuel), mois)));
  } else {
    remboursementMensuel = montant / mois;
  }

  return remboursementMensuel;
}

let calculAmortissement = (montant, tauxMensuel, mois, annee) => {
  let remboursementMensuel = calculMensualite(montant, tauxMensuel, mois);
  console.log(remboursementMensuel);
  let balance = montant; // total
  let amortissementY = [];
  let amortissementM = [];
  for (let y = 0; y < annee; y++) {
    let interestY = 0; //Interest payment for year y
    let montantY = 0; //montant payment for year y
    for (let m = 0; m < 12; m++) {
      let interestM = balance * tauxMensuel; //Interest payment for month m
      let montantM = remboursementMensuel - interestM; //montant payment for month m
      interestY = interestY + interestM;
      montantY = montantY + montantM;
      balance = balance - montantM;
      amortissementM.push({
        remboursementMensuel,
        capitalAmorti: montantM,
        interet: interestM,
        capitalRestantDu: balance
      });
    }
    amortissementY.push({
      remboursementMensuel,
      capitalAmorti: montantY,
      interet: interestY,
      capitalRestantDu: balance
    });
  }

  return {
    remboursementMensuel,
    amortissementY,
    amortissementM
  };
};

function remplirTableau(amortissement) {
  let html = `<thead>
    <tr>
      <th>Période</th>
      <th class="help-title" data-help="1">Capital Amorti</th>
      <th class="help-title" data-help="2">Interets</th>
      <th class="help-title" data-help="3">Capital restant du</th>
      <th class="help-title" data-help="4">Mensualité</th>
    </tr>
  </thead>`;
  amortissement.forEach(({
    remboursementMensuel,
    capitalAmorti,
    interet,
    capitalRestantDu
  }, index) => html += `
    <tr class=${Math.round(capitalAmorti) < Math.round(interet) ? "warning" : ""}>
      <td>${index + 1}</td>
      <td class="">${capitalAmorti.toFixed(2)}</td>
      <td class="">${interet.toFixed(2)}</td>
      <td class="">${capitalRestantDu.toFixed(2)}</td>
      <td class="">${remboursementMensuel.toFixed(2)}</td>
    </tr>
  `);
  document.getElementById("inputMensualite").innerHTML = html;
  function showHelpBubble(element, text) {
    const bubble = document.createElement("div");
    bubble.className = "help-bubble";
    switch (text) {
      case "1":
      bubble.innerText = "L'argent qui a été remboursé du prêt";
      break;
      case "2":
      bubble.innerText = "Le taux d'interet de ce versement";
      break;
      case "3":
      bubble.innerText = "La somme restante a remboursé";
      break;
      case "4":
      bubble.innerText = "L'argent que vous avez du payer ce mois";
      break;
      default:
      bubble.innerText = "Texte non reconnu";
    }
    document.body.appendChild(bubble);

    const rect = element.getBoundingClientRect();
    bubble.style.left = `${rect.left - window.scrollX-80}px`;
    bubble.style.top = `${rect.top - window.scrollY - 20}px`;

    element._helpBubble = bubble; // Stocker la bulle dans l'élément
  }

  // Fonction pour masquer la bulle d'aide
  function hideHelpBubble(element) {
    if (element._helpBubble) {
      element._helpBubble.remove();
      element._helpBubble = null;
    }
  }
  // Ajout des écouteurs d'événements pour les titres du tableau
  document.querySelectorAll(".help-title").forEach(title => {
    title.addEventListener("mouseover", function() {
      showHelpBubble(title, title.dataset.help);
    });
    title.addEventListener("mouseout", function() {
      hideHelpBubble(title);
    });
  });
}

Array.from(document.querySelectorAll('input'), input => {
  input.addEventListener("input", function(event) {
    let {
      montant,
      tauxMensuel,
      mois,
      annee
    } = getValues();
    // appel soit amortissementM ou amortissementY
    let {
      amortissementM
    } = calculAmortissement(montant, tauxMensuel, mois, annee);

    remplirTableau(amortissementM);

  }, false);
});

document.addEventListener("DOMContentLoaded", function() {
  // Fonction pour afficher la bulle d'aide
  function showHelpBubble(element, text) {
    const bubble = document.createElement("div");
    bubble.className = "help-bubble";
    bubble.innerText = text;
    document.body.appendChild(bubble);
    const rect = element.getBoundingClientRect();
    bubble.style.left = `${rect.left + window.scrollX}px`;
    bubble.style.top = `${rect.bottom + window.scrollY}px`;

    element._helpBubble = bubble; // Stocker la bulle dans l'élément
  }

  // Fonction pour masquer la bulle d'aide
  function hideHelpBubble(element) {
    if (element._helpBubble) {
      element._helpBubble.remove();
      element._helpBubble = null;
    }
  }

  // Ajout des écouteurs d'événements pour les boutons d'aide
  document.querySelectorAll(".btn-aide").forEach(button => {
    button.addEventListener("mouseover", function() {
      showHelpBubble(button, button.id === "aideTaux" ? "Le taux d'intérêt annuel est exprimé en pourcentage. \nPar exemple, si le taux d'intérêt est de 5%, vous devez saisir 5. \nDe plus, ce taux est recalculé chaque mois donc le calcul mensuel est le suivant : Somme restante * (1 + taux d'intérêt annuel / 12)" : "Le montant du prêt est la somme que vous empruntez. \nPar exemple, si vous empruntez 1000 €, vous devez saisir 1000.\n📌Plus vous prenez de temps à rembourser, plus grands seront les intérêts");
    });
    button.addEventListener("mouseout", function() {
      hideHelpBubble(button);
    });
  });
});

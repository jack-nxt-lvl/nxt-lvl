// Material identity only; purchaser and order approval are required.
(()=>{
 if(typeof compounds==='undefined'||!Array.isArray(compounds))return;
 const products=[
  {
    "id": "glutathione-1500",
    "name": "Glutathione — 1.5g",
    "category": "freeze-dried",
    "amount": "1.5g (1500mg) per 10mL vial",
    "form": "Lyophilized Powder",
    "appearance": "White / Off-White Powder",
    "molecularFormula": "C10H17N3O6S",
    "pricing": [
      {
        "label": "1 Vial",
        "price": 110.6
      },
      {
        "label": "5 Vials",
        "price": 453.6
      },
      {
        "label": "10 Vials",
        "price": 774.2
      }
    ],
    "aka": "Laboratory research material",
    "badge": "",
    "protocols": [],
    "tags": [
      "Laboratory research",
      "Documentation review"
    ],
    "shortDesc": "Glutathione — 1.5g. Material information for qualified laboratory research. Request the applicable lot documentation.",
    "description": "This listing identifies Glutathione — 1.5g, supplied as 1.5g (1500mg) per 10mL vial. Review the identity, lot-specific analytical report and handling documentation against your laboratory requirements before requesting approval. Not for human or veterinary use.",
    "benefits": [],
    "sideEffects": [],
    "purity": "Refer to the lot-specific report",
    "storage": "Request the applicable supplier handling and storage documentation.",
    "warnings": "For laboratory research only. Not for human or veterinary consumption, administration, diagnosis or treatment.",
    "suggestedCompanions": []
  }
];
 for(const p of products){const i=compounds.findIndex(x=>x.id===p.id);if(i<0)compounds.push(p);else compounds[i]=p;}
 if(typeof renderGrid==='function')renderGrid('all');
})();

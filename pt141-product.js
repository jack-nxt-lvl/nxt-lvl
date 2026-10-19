// Material identity only; purchaser and order approval are required.
(()=>{
 if(typeof compounds==='undefined'||!Array.isArray(compounds))return;
 const products=[
  {
    "id": "pt141-10",
    "name": "PT-141 — 10mg",
    "category": "freeze-dried",
    "amount": "10mg per vial",
    "form": "Lyophilized Powder",
    "appearance": "White / Off-White Powder",
    "molecularFormula": "C50H68N14O10",
    "pricing": [
      {
        "label": "1 Vial",
        "price": 63
      },
      {
        "label": "5 Vials",
        "price": 258.3
      },
      {
        "label": "10 Vials",
        "price": 441
      }
    ],
    "aka": "Laboratory research material",
    "badge": "",
    "protocols": [],
    "tags": [
      "Laboratory research",
      "Documentation review"
    ],
    "shortDesc": "PT-141 — 10mg. Material information for qualified laboratory research. Request the applicable lot documentation.",
    "description": "This listing identifies PT-141 — 10mg, supplied as 10mg per vial. Review the identity, lot-specific analytical report and handling documentation against your laboratory requirements before requesting approval. Not for human or veterinary use.",
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

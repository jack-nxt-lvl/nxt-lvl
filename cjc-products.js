// Material identity only; purchaser and order approval are required.
(()=>{
 if(typeof compounds==='undefined'||!Array.isArray(compounds))return;
 const products=[
  {
    "id": "cjc1295-dac-10",
    "name": "CJC-1295 with DAC — 10mg",
    "category": "freeze-dried",
    "amount": "10mg per vial",
    "form": "Lyophilized Powder",
    "appearance": "White / Off-White Powder",
    "molecularFormula": "CJC-1295 with DAC",
    "pricing": [
      {
        "label": "1 Vial",
        "price": 144.89
      },
      {
        "label": "2 Vials",
        "price": 289.77
      },
      {
        "label": "3 Vials",
        "price": 434.65
      },
      {
        "label": "4 Vials",
        "price": 579.53
      },
      {
        "label": "5 Vials",
        "price": 724.42
      }
    ],
    "aka": "Laboratory research material",
    "badge": "",
    "protocols": [],
    "tags": [
      "Laboratory research",
      "Documentation review"
    ],
    "shortDesc": "CJC-1295 with DAC — 10mg. Material information for qualified laboratory research. Request the applicable lot documentation.",
    "description": "This listing identifies CJC-1295 with DAC — 10mg, supplied as 10mg per vial. Review the identity, lot-specific analytical report and handling documentation against your laboratory requirements before requesting approval. Not for human or veterinary use.",
    "benefits": [],
    "sideEffects": [],
    "purity": "Refer to the lot-specific report",
    "storage": "Request the applicable supplier handling and storage documentation.",
    "warnings": "For laboratory research only. Not for human or veterinary consumption, administration, diagnosis or treatment.",
    "suggestedCompanions": []
  },
  {
    "id": "cjc1295-no-dac-10",
    "name": "CJC-1295 without DAC — 10mg",
    "category": "freeze-dried",
    "amount": "10mg per vial",
    "form": "Lyophilized Powder",
    "appearance": "White / Off-White Powder",
    "molecularFormula": "Modified GRF (1-29) / no DAC",
    "pricing": [
      {
        "label": "1 Vial",
        "price": 144.89
      },
      {
        "label": "2 Vials",
        "price": 289.77
      },
      {
        "label": "3 Vials",
        "price": 434.65
      },
      {
        "label": "4 Vials",
        "price": 579.53
      },
      {
        "label": "5 Vials",
        "price": 724.42
      }
    ],
    "aka": "Laboratory research material",
    "badge": "",
    "protocols": [],
    "tags": [
      "Laboratory research",
      "Documentation review"
    ],
    "shortDesc": "CJC-1295 without DAC — 10mg. Material information for qualified laboratory research. Request the applicable lot documentation.",
    "description": "This listing identifies CJC-1295 without DAC — 10mg, supplied as 10mg per vial. Review the identity, lot-specific analytical report and handling documentation against your laboratory requirements before requesting approval. Not for human or veterinary use.",
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

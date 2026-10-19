// Material identity only; purchaser and order approval are required.
(()=>{
 if(typeof compounds==='undefined'||!Array.isArray(compounds))return;
 const products=[
  {
    "id": "bac-water-10ml",
    "name": "Bacteriostatic Water — 10mL",
    "category": "freeze-dried",
    "amount": "10mL per vial",
    "form": "Preserved water",
    "appearance": "Clear, Colorless Liquid",
    "molecularFormula": "H₂O + C₇H₈O (0.9% benzyl alcohol)",
    "pricing": [
      {
        "label": "1 Vial",
        "price": 16.10
      },
      {
        "label": "5 Vials",
        "price": 66.01
      },
      {
        "label": "10 Vials",
        "price": 112.70
      }
    ],
    "aka": "Laboratory research material",
    "badge": "",
    "protocols": [],
    "tags": [
      "Laboratory research",
      "Documentation review"
    ],
    "shortDesc": "Bacteriostatic Water — 10mL. Material information for qualified laboratory research. Request the applicable lot documentation.",
    "description": "This listing identifies Bacteriostatic Water — 10mL, supplied as 10mL per vial. Review the identity, lot-specific analytical report and handling documentation against your laboratory requirements before requesting approval. Not for human or veterinary use.",
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

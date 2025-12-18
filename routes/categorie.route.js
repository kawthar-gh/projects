var express = require('express');
var router = express.Router();
// Créer une instance de categorie.
const Categorie = require('../models/categorie');

// afficher la liste des categories.
router.get('/', async (req, res, )=> {
    try{
        const cat = await Categorie.find({}, null, {sort:{'_id':-1}});
        res.status(200).json(cat);
    }catch(err){
        res.status(404).json({ message: err.message });
    }

});

// créer un nouvelle catégorie
router.post('/', async (req, res) => {
    const { nomcategorie, imagecategorie } = req.body;
    const newCategorie = new Categorie({ nomcategorie: nomcategorie, imagecategorie: imagecategorie });
    try{
        await newCategorie.save();
        res.status(200).json(newCategorie);
    }catch(err){
        res.status(404).json({ message: err.message });
    }
});

// chercher une catégorie
router.get('/:categorieId',async(req, res)=>{
});

// modifier une catégorie
router.put('/:categorieId', async (req, res)=> {
    try{
        const cat1= await Categorie.findByIdAndUpdate(
            req.params.categorieId,
            {$set:req.body},
            {new:true}
        );
        res.status(200).json(cat1);
    }catch(err){
        res.status(404).json({ message: err.message });
    }
});

// Supprimer une catégorie
router.delete('/:categorieId', async (req, res)=> {
    const id = req.params.categorieId;
    await Categorie.findByIdAndDelete(id);
    res.json({ message: 'Categorie deleted successfully.' });
});

module.exports = router;
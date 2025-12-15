import React, { useState } from 'react';

const PNJForm = ({ onAddPNJ, onCancel, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        role: '',
        description: '',
        caractere: [{ name: '', description: '' }],
        informations: [{ name: '', description: '' }],
        localisation: '',
        portrait: null,
        portraitPreview: null
    });

    // Update form when initialData changes
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                portraitPreview: initialData.portrait,
                caractere: initialData.caractere && initialData.caractere.length > 0 ? initialData.caractere : [{ name: '', description: '' }],
                informations: initialData.informations && initialData.informations.length > 0 ? initialData.informations : [{ name: '', description: '' }]
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePortraitChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Toujours compresser les images pour éviter les problèmes
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Réduire la taille tout en conservant le ratio
                    // Utiliser 600px comme maximum pour les portraits
                    const maxDimension = 600;
                    if (width > height && width > maxDimension) {
                        height = (height * maxDimension) / width;
                        width = maxDimension;
                    } else if (height > maxDimension) {
                        width = (width * maxDimension) / height;
                        height = maxDimension;
                    }
                    
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convertir en base64 avec compression JPEG à 75%
                    const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.75);
                    
                    // Vérifier la taille finale (debug info removed)
                    
                    setFormData(prev => ({
                        ...prev,
                        portrait: file,
                        portraitPreview: compressedDataUrl
                    }));
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCaractereChange = (index, field, value) => {
        const newCaractere = [...formData.caractere];
        newCaractere[index] = { ...newCaractere[index], [field]: value };
        setFormData(prev => ({ ...prev, caractere: newCaractere }));
    };

    const addCaractere = () => {
        setFormData(prev => ({
            ...prev,
            caractere: [...prev.caractere, { name: '', description: '' }]
        }));
    };

    const removeCaractere = (index) => {
        setFormData(prev => ({
            ...prev,
            caractere: prev.caractere.filter((_, i) => i !== index)
        }));
    };

    const handleInformationChange = (index, field, value) => {
        const newInformations = [...formData.informations];
        newInformations[index] = { ...newInformations[index], [field]: value };
        setFormData(prev => ({ ...prev, informations: newInformations }));
    };

    const addInformation = () => {
        setFormData(prev => ({
            ...prev,
            informations: [...prev.informations, { name: '', description: '' }]
        }));
    };

    const removeInformation = (index) => {
        setFormData(prev => ({
            ...prev,
            informations: prev.informations.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const pnj = {
            id: initialData?.id || Date.now(),
            name: formData.name,
            role: formData.role,
            description: formData.description,
            caractere: formData.caractere.filter(c => c.name.trim() !== ''),
            informations: formData.informations.filter(i => i.name.trim() !== ''),
            localisation: formData.localisation,
            portrait: formData.portraitPreview
        };

        onAddPNJ(pnj);
        
        // Reset form
        setFormData({
            name: '',
            role: '',
            description: '',
            caractere: [{ name: '', description: '' }],
            informations: [{ name: '', description: '' }],
            localisation: '',
            portrait: null,
            portraitPreview: null
        });
    };

    return (
        <form className="pnj-form" onSubmit={handleSubmit}>
            <button type="button" className="cancel-form-btn" onClick={onCancel}>
                ✕
            </button>
            
            <h2>{initialData ? 'Modifier le PNJ' : 'Ajouter un nouveau PNJ'}</h2>
            
            <div className="form-group">
                <label htmlFor="pnj-portrait">Portrait</label>
                <input
                    type="file"
                    id="pnj-portrait"
                    accept="image/*"
                    onChange={handlePortraitChange}
                />
                {formData.portraitPreview && (
                    <div className="portrait-preview">
                        <img src={formData.portraitPreview} alt="Aperçu" />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="pnj-name">Nom *</label>
                <input
                    type="text"
                    id="pnj-name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    placeholder="Nom du personnage"
                />
            </div>

            <div className="form-group">
                <label htmlFor="pnj-role">Rôle / Profession</label>
                <input
                    type="text"
                    id="pnj-role"
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    placeholder="Ex: Aubergiste, Forgeron, Marchand, Noble..."
                />
            </div>

            <div className="form-group">
                <label htmlFor="pnj-description">Description</label>
                <textarea
                    id="pnj-description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows="4"
                    placeholder="Apparence physique, historique, motivations..."
                />
            </div>

            <div className="form-group">
                <label htmlFor="pnj-localisation">Localisation</label>
                <input
                    type="text"
                    id="pnj-localisation"
                    value={formData.localisation}
                    onChange={(e) => handleChange('localisation', e.target.value)}
                    placeholder="Où peut-on trouver ce PNJ ?"
                />
            </div>

            <div className="form-group caractere-group">
                <label>Traits de caractère</label>
                {formData.caractere.map((trait, idx) => (
                    <div key={idx} className="caractere-input-group">
                        <input
                            type="text"
                            placeholder="Trait (ex: Méfiant, Généreux, Colérique...)"
                            value={trait.name}
                            onChange={(e) => handleCaractereChange(idx, 'name', e.target.value)}
                        />
                        <textarea
                            placeholder="Description de ce trait / comment il se manifeste"
                            value={trait.description}
                            onChange={(e) => handleCaractereChange(idx, 'description', e.target.value)}
                            rows="2"
                        />
                        {formData.caractere.length > 1 && (
                            <button
                                type="button"
                                className="remove-caractere-btn"
                                onClick={() => removeCaractere(idx)}
                                aria-label="Supprimer ce trait"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" className="add-caractere-btn" onClick={addCaractere}>
                    + Ajouter un trait
                </button>
            </div>

            <div className="form-group informations-group">
                <label>Informations possédées</label>
                {formData.informations.map((info, idx) => (
                    <div key={idx} className="information-input-group">
                        <input
                            type="text"
                            placeholder="Sujet de l'information"
                            value={info.name}
                            onChange={(e) => handleInformationChange(idx, 'name', e.target.value)}
                        />
                        <textarea
                            placeholder="Détails de l'information que le PNJ peut révéler"
                            value={info.description}
                            onChange={(e) => handleInformationChange(idx, 'description', e.target.value)}
                            rows="2"
                        />
                        {formData.informations.length > 1 && (
                            <button
                                type="button"
                                className="remove-information-btn"
                                onClick={() => removeInformation(idx)}
                                aria-label="Supprimer cette information"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" className="add-information-btn" onClick={addInformation}>
                    + Ajouter une information
                </button>
            </div>

            <button type="submit" className="submit-pnj-btn">
                {initialData ? '✓ Mettre à jour' : '+ Ajouter le PNJ'}
            </button>
        </form>
    );
};

export default PNJForm;

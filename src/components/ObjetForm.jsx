import React, { useState } from 'react';

const ObjetForm = ({ onAddObjet, onCancel, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        // uses: 1..3 or '∞'
        uses: 1,
        description: '',
        effets: [{ name: '', description: '' }],
        image: null,
        imagePreview: null
    });

    // Update form when initialData changes
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                // support older objects that might have `rarete` or `type` by keeping uses default
                uses: initialData.uses !== undefined ? initialData.uses : 1,
                imagePreview: initialData.image,
                effets: initialData.effets && initialData.effets.length > 0 ? initialData.effets : [{ name: '', description: '' }]
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    image: file,
                    imagePreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEffetChange = (index, field, value) => {
        const newEffets = [...formData.effets];
        newEffets[index] = { ...newEffets[index], [field]: value };
        setFormData(prev => ({ ...prev, effets: newEffets }));
    };

    const addEffet = () => {
        setFormData(prev => ({
            ...prev,
            effets: [...prev.effets, { name: '', description: '' }]
        }));
    };

    const removeEffet = (index) => {
        setFormData(prev => ({
            ...prev,
            effets: prev.effets.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const objet = {
            id: initialData?.id || Date.now(),
            name: formData.name,
            // store uses (1/2/3 or '∞')
            uses: formData.uses,
            description: formData.description,
            effets: formData.effets.filter(e => e.name.trim() !== ''),
            image: formData.imagePreview
        };

        onAddObjet(objet);
        
        // Reset form
        setFormData({
            name: '',
            uses: 1,
            description: '',
            effets: [{ name: '', description: '' }],
            image: null,
            imagePreview: null
        });
    };

    return (
        <form className="objet-form" onSubmit={handleSubmit}>
            <button type="button" className="cancel-form-btn" onClick={onCancel}>
                ✕
            </button>
            
            <h2>{initialData ? 'Modifier l\'objet' : 'Ajouter un nouvel objet'}</h2>
            
            <div className="form-group">
                <label htmlFor="objet-image">Image</label>
                <input
                    type="file"
                    id="objet-image"
                    accept="image/*"
                    onChange={handleImageChange}
                />
                {formData.imagePreview && (
                    <div className="image-preview">
                        <img src={formData.imagePreview} alt="Aperçu" />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="objet-name">Nom *</label>
                <input
                    type="text"
                    id="objet-name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                    placeholder="Nom de l'objet"
                />
            </div>

            <div className="form-group">
                <label htmlFor="objet-uses">Nombre d'utilisation</label>
                <select
                    id="objet-uses"
                    value={formData.uses}
                    onChange={(e) => handleChange('uses', e.target.value === '∞' ? '∞' : Number(e.target.value))}
                >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={'∞'}>∞</option>
                </select>
            </div>

            <div className="form-group">
                <label htmlFor="objet-description">Description</label>
                <textarea
                    id="objet-description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows="4"
                    placeholder="Description détaillée de l'objet..."
                />
            </div>

            <div className="form-group effets-group">
                <label>Effets</label>
                {formData.effets.map((effet, idx) => (
                    <div key={idx} className="effet-input-group">
                        <input
                            type="text"
                            placeholder="Nom de l'effet"
                            value={effet.name}
                            onChange={(e) => handleEffetChange(idx, 'name', e.target.value)}
                        />
                        <textarea
                            placeholder="Description de l'effet"
                            value={effet.description}
                            onChange={(e) => handleEffetChange(idx, 'description', e.target.value)}
                            rows="2"
                        />
                        {formData.effets.length > 1 && (
                            <button
                                type="button"
                                className="remove-effet-btn"
                                onClick={() => removeEffet(idx)}
                                aria-label="Supprimer cet effet"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" className="add-effet-btn" onClick={addEffet}>
                    + Ajouter un effet
                </button>
            </div>

            <button type="submit" className="submit-objet-btn">
                {initialData ? '✓ Mettre à jour' : '+ Ajouter l\'objet'}
            </button>
        </form>
    );
};

export default ObjetForm;

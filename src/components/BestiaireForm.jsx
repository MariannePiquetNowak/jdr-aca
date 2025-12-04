import React, { useState } from 'react';

const BestiaireForm = ({ onAddEnemy, onCancel, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
        name: '',
        description: '',
        dangerLevel: 1,
        powers: [{ name: '', description: '' }],
        butin: [{ name: '', description: '' }],
        portrait: null,
        portraitPreview: null
    });

    // Update form when initialData changes
    React.useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                portraitPreview: initialData.portrait,
                powers: initialData.powers && initialData.powers.length > 0 ? initialData.powers : [{ name: '', description: '' }],
                butin: initialData.butin && initialData.butin.length > 0 ? initialData.butin : [{ name: '', description: '' }]
            });
        }
    }, [initialData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePortraitChange = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({
                    ...prev,
                    portrait: file,
                    portraitPreview: reader.result
                }));
            };
            reader.readAsDataURL(file);
        } else {
            alert('Veuillez choisir une image au format PNG, JPG ou JPEG.');
        }
    };

    const handlePowerChange = (index, field, value) => {
        const newPowers = [...formData.powers];
        newPowers[index] = { ...newPowers[index], [field]: value };
        setFormData(prev => ({ ...prev, powers: newPowers }));
    };

    const addPower = () => {
        setFormData(prev => ({
            ...prev,
            powers: [...prev.powers, { name: '', description: '' }]
        }));
    };

    const removePower = (index) => {
        setFormData(prev => ({
            ...prev,
            powers: prev.powers.filter((_, i) => i !== index)
        }));
    };

    const handleButinChange = (index, field, value) => {
        const newButin = [...formData.butin];
        newButin[index] = { ...newButin[index], [field]: value };
        setFormData(prev => ({ ...prev, butin: newButin }));
    };

    const addButin = () => {
        setFormData(prev => ({
            ...prev,
            butin: [...prev.butin, { name: '', description: '' }]
        }));
    };

    const removeButin = (index) => {
        setFormData(prev => ({
            ...prev,
            butin: prev.butin.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            alert('Le nom de l\'ennemi est obligatoire.');
            return;
        }

        const enemy = {
            id: initialData?.id || Date.now(), // Keep existing ID or generate new one
            name: formData.name,
            description: formData.description,
            dangerLevel: formData.dangerLevel,
            powers: formData.powers.filter(p => p.name.trim() !== ''),
            butin: formData.butin.filter(b => b.name.trim() !== ''),
            portrait: formData.portraitPreview
        };

        onAddEnemy(enemy);

        // Reset form
        setFormData({
            name: '',
            description: '',
            dangerLevel: 1,
            powers: [{ name: '', description: '' }],
            butin: [{ name: '', description: '' }],
            portrait: null,
            portraitPreview: null
        });
    };

    return (
        <form className="bestiaire-form" onSubmit={handleSubmit}>
            {onCancel && (
                <button 
                    type="button" 
                    className="cancel-form-btn"
                    onClick={onCancel}
                    aria-label="Annuler"
                >
                    ✕
                </button>
            )}
            <h3>{initialData ? 'Modifier l\'ennemi' : 'Ajouter un nouvel ennemi'}</h3>

            <div className="form-group">
                <label htmlFor="enemy-portrait">Portrait (PNG/JPG/JPEG)</label>
                <input
                    type="file"
                    id="enemy-portrait"
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    onChange={handlePortraitChange}
                />
                {formData.portraitPreview && (
                    <div className="portrait-preview">
                        <img src={formData.portraitPreview} alt="Aperçu du portrait" />
                    </div>
                )}
            </div>

            <div className="form-group">
                <label htmlFor="enemy-name">Nom *</label>
                <input
                    type="text"
                    id="enemy-name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                />
            </div>

            <div className="form-group">
                <label htmlFor="enemy-description">Description</label>
                <textarea
                    id="enemy-description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows="4"
                    placeholder="Sorcier des morts, assoiffé de connaissance et de domination..."
                />
            </div>

            <div className="form-group">
                <label htmlFor="enemy-danger">
                    Niveau de danger (1-10) : {'★'.repeat(formData.dangerLevel)}
                </label>
                <input
                    type="range"
                    id="enemy-danger"
                    min="1"
                    max="10"
                    value={formData.dangerLevel}
                    onChange={(e) => handleChange('dangerLevel', Number(e.target.value))}
                />
                <span className="danger-value">{formData.dangerLevel}</span>
            </div>

            <div className="form-group powers-group">
                <label>Pouvoirs</label>
                {formData.powers.map((power, idx) => (
                    <div key={idx} className="power-input-group">
                        <input
                            type="text"
                            placeholder="Nom du pouvoir"
                            value={power.name}
                            onChange={(e) => handlePowerChange(idx, 'name', e.target.value)}
                        />
                        <textarea
                            placeholder="Description du pouvoir"
                            value={power.description}
                            onChange={(e) => handlePowerChange(idx, 'description', e.target.value)}
                            rows="2"
                        />
                        {formData.powers.length > 1 && (
                            <button
                                type="button"
                                className="remove-power-btn"
                                onClick={() => removePower(idx)}
                                aria-label="Supprimer ce pouvoir"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" className="add-power-btn" onClick={addPower}>
                    + Ajouter un pouvoir
                </button>
            </div>

            <div className="form-group butin-group">
                <label>Butin</label>
                {formData.butin.map((item, idx) => (
                    <div key={idx} className="butin-input-group">
                        <input
                            type="text"
                            placeholder="Nom de l'objet"
                            value={item.name}
                            onChange={(e) => handleButinChange(idx, 'name', e.target.value)}
                        />
                        <textarea
                            placeholder="Description de l'objet"
                            value={item.description}
                            onChange={(e) => handleButinChange(idx, 'description', e.target.value)}
                            rows="2"
                        />
                        {formData.butin.length > 1 && (
                            <button
                                type="button"
                                className="remove-butin-btn"
                                onClick={() => removeButin(idx)}
                                aria-label="Supprimer cet objet"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <button type="button" className="add-butin-btn" onClick={addButin}>
                    + Ajouter un objet
                </button>
            </div>

            <button type="submit" className="submit-enemy-btn">
                {initialData ? '✓ Enregistrer les modifications' : '✓ Ajouter l\'ennemi'}
            </button>
        </form>
    );
};

export default BestiaireForm;

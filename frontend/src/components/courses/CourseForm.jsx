import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function CourseForm({ initial = {}, submitLabel, loading, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: initial.title || '',
    subject: initial.subject || '',
    content: initial.content || '',
  });
  const [validated, setValidated] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidated(true);
    if (e.currentTarget.checkValidity()) onSubmit(form);
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Titre du cours</Form.Label>
        <Form.Control name="title" value={form.title} onChange={handleChange} required />
        <Form.Control.Feedback type="invalid">Le titre est requis.</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Matière</Form.Label>
        <Form.Control name="subject" value={form.subject} onChange={handleChange} required />
        <Form.Control.Feedback type="invalid">La matière est requise.</Form.Control.Feedback>
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Contenu du cours</Form.Label>
        <Form.Control
          as="textarea"
          rows={12}
          name="content"
          value={form.content}
          onChange={handleChange}
          minLength={50}
          maxLength={50000}
          required
        />
        <Form.Control.Feedback type="invalid">Collez au moins 50 caractères de cours.</Form.Control.Feedback>
        <Form.Text className="text-muted">{form.content.length} / 50000 caractères</Form.Text>
      </Form.Group>
      <div className="d-flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? 'Enregistrement...' : submitLabel}</Button>
        <Button variant="outline-secondary" onClick={onCancel}>Annuler</Button>
      </div>
    </Form>
  );
}
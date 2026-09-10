import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mediaService, masterService } from '../../services';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function MediaEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { hasRole } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', category_id: '', department_id: '', event_date: ''
  });

  useEffect(() => {
    Promise.all([
      mediaService.get(id),
      masterService.categories(),
      masterService.departments()
    ]).then(([mRes, cRes, dRes]) => {
      const m = mRes.data.data;
      setFormData({
        title: m.title,
        description: m.description || '',
        category_id: m.category.id,
        department_id: m.department.id,
        event_date: m.event_date
      });
      setCategories(cRes.data.data);
      setDepartments(dRes.data.data);
      setFetching(false);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    try {
      await mediaService.update(id, data);
      toast.success('Media berhasil diperbarui');
      navigate(`/media/${id}`);
    } catch (err) {
      toast.error('Gagal memperbarui media');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner fullScreen />;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Edit Media</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-sm border border-slate-200 space-y-4">
        <input name="title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full p-2 border rounded" required />
        <textarea name="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full p-2 border rounded"></textarea>
        <select name="category_id" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})} className="w-full p-2 border rounded">
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">{loading ? '...' : 'Simpan'}</button>
      </form>
    </div>
  );
}
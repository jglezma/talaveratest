import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiService } from '../services/api.service';
import { Project } from '../types';
import { useNavigate } from 'react-router-dom';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'active' as 'active' | 'inactive' | 'completed'
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    // Verificar si debe mostrar el formulario de creación
    if (searchParams.get('action') === 'create') {
      setShowCreateForm(true);
      // Limpiar el parámetro de la URL
      setSearchParams({});
    }
    
    fetchProjects();
  }, [searchParams, setSearchParams]);

  const fetchProjects = async () => {
    try {
      console.log('🔄 Fetching projects...');
      const data = await ApiService.getProjects();
      console.log('✅ Projects loaded:', data);
      setProjects(data);
    } catch (error: any) {
      console.error('❌ Failed to fetch projects:', error);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      console.log('🔄 Creating project:', formData);
      const newProject = await ApiService.createProject(formData);
      console.log('✅ Project created:', newProject);
      
      setProjects([newProject, ...projects]);
      setShowCreateForm(false);
      setFormData({ title: '', description: '', status: 'active' });
    } catch (error: any) {
      console.error('❌ Failed to create project:', error);
      setError('Failed to create project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    
    setFormLoading(true);

    try {
      console.log('🔄 Updating project:', editingProject.id, formData);
      const updatedProject = await ApiService.updateProject(editingProject.id, formData);
      console.log('✅ Project updated:', updatedProject);
      
      setProjects(projects.map(p => p.id === editingProject.id ? updatedProject : p));
      setEditingProject(null);
      setFormData({ title: '', description: '', status: 'active' });
    } catch (error: any) {
      console.error('❌ Failed to update project:', error);
      setError('Failed to update project');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      return;
    }

    try {
      console.log('🔄 Deleting project:', project.id);
      await ApiService.deleteProject(project.id);
      console.log('✅ Project deleted');
      
      setProjects(projects.filter(p => p.id !== project.id));
    } catch (error: any) {
      console.error('❌ Failed to delete project:', error);
      setError('Failed to delete project');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      status: project.status
    });
    setShowCreateForm(false);
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setEditingProject(null);
    setFormData({ title: '', description: '', status: 'active' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return { bg: '#d4edda', color: '#155724', text: '🟢 Active' };
      case 'completed':
        return { bg: '#d1ecf1', color: '#0c5460', text: '✅ Completed' };
      case 'inactive':
        return { bg: '#fff3cd', color: '#856404', text: '⏸️ Inactive' };
      default:
        return { bg: '#f8d7da', color: '#721c24', text: '❓ Unknown' };
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔄</div>
          <div>Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2.5rem', 
            margin: '0 0 0.5rem 0', 
            color: '#343a40',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            📁 My Projects
          </h1>
          <p style={{ color: '#6c757d', margin: 0 }}>
            Manage your projects and track their progress
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
  <button
    onClick={() => navigate('/plans')}
    style={{
      padding: '0.5rem 1rem',
      backgroundColor: 'transparent',
      color: '#6f42c1',
      border: '2px solid #6f42c1',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '0.9rem'
    }}
  >
    💎 Upgrade Plan
  </button>
  
  <button
    onClick={() => {
      setShowCreateForm(true);
      setEditingProject(null);
      setFormData({ title: '', description: '', status: 'active' });
    }}
    style={{
      padding: '0.75rem 1.5rem',
      backgroundColor: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}
  >
    ➕ New Project
  </button>
</div>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          marginBottom: '2rem',
          backgroundColor: '#f8d7da', 
          color: '#721c24',
          borderRadius: '8px',
          border: '1px solid #f5c6cb'
        }}>
          ❌ {error}
          <button 
            onClick={() => setError('')}
            style={{ 
              marginLeft: '1rem', 
              background: 'none', 
              border: 'none', 
              color: '#721c24', 
              cursor: 'pointer' 
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingProject) && (
        <div style={{ 
          marginBottom: '2rem',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #dee2e6'
        }}>
          <h3 style={{ 
            margin: '0 0 1.5rem 0', 
            color: '#343a40',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {editingProject ? '✏️ Edit Project' : '🚀 Create New Project'}
          </h3>

          <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Project Title:
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Enter project title"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Description:
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                placeholder="Describe your project"
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Status:
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
              >
                <option value="active">🟢 Active</option>
                <option value="inactive">⏸️ Inactive</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                disabled={formLoading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: formLoading ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: formLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                {formLoading ? '🔄 Saving...' : editingProject ? '💾 Update Project' : '🚀 Create Project'}
              </button>

              <button
                type="button"
                onClick={handleCancelForm}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '1px solid #6c757d',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px dashed #dee2e6'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📁</div>
          <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>
            No projects yet
          </h3>
          <p style={{ margin: '0 0 2rem 0', color: '#6c757d' }}>
            Create your first project to get started
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '1rem 2rem',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            🚀 Create Your First Project
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {projects.map(project => {
            const statusInfo = getStatusColor(project.status);
            return (
              <div key={project.id} style={{ 
                padding: '2rem', 
                backgroundColor: 'white',
                borderRadius: '12px',
                border: '1px solid #dee2e6',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      margin: '0 0 0.5rem 0', 
                      color: '#343a40',
                      fontSize: '1.5rem'
                    }}>
                      {project.title}
                    </h3>
                    <p style={{ 
                      margin: '0 0 1rem 0', 
                      color: '#6c757d', 
                      lineHeight: '1.6',
                      fontSize: '1rem'
                    }}>
                      {project.description}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ 
                        display: 'inline-block',
                        padding: '0.5rem 1rem',
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}>
                        {statusInfo.text}
                      </span>
                      
                      <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                        📅 Created: {new Date(project.created_at).toLocaleDateString()}
                      </span>
                      
                      <span style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                        🔄 Updated: {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                    <button
                      onClick={() => handleEditProject(project)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#ffc107',
                        color: '#212529',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      ✏️ Edit
                    </button>
                    
                    <button
                      onClick={() => handleDeleteProject(project)}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 'bold'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Projects;
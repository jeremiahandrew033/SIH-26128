import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from '../i18n/useTranslation';
import { FolderHeart, AlertTriangle, Skull, Syringe, ClipboardList, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';

export const FarmerPortal: React.FC = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  const services = [
    {
      id: 'animals',
      to: '/farmer/animals',
      title: t('myAnimals'),
      description: 'View registered cattle, buffalo, goats, sheep, and poultry records.',
      icon: FolderHeart,
      color: 'forest',
      borderColor: 'border-forest-500/30 hover:border-forest-500/60',
      bgColor: 'bg-forest-500/10',
      textColor: 'text-forest-400',
    },
    {
      id: 'report',
      to: '/farmer/report',
      title: t('reportSickAnimal'),
      description: 'Submit symptoms, photo evidence, and GPS location for rapid response. Works offline.',
      icon: AlertTriangle,
      color: 'alert',
      borderColor: 'border-alert-500/30 hover:border-alert-500/60',
      bgColor: 'bg-alert-500/10',
      textColor: 'text-alert-400',
    },
    {
      id: 'mortality',
      to: '/farmer/mortality',
      title: t('reportMortality'),
      description: 'Record animal or herd death numbers with location disclaimer. Works offline.',
      icon: Skull,
      color: 'critical',
      borderColor: 'border-critical-500/30 hover:border-critical-500/60',
      bgColor: 'bg-critical-500/10',
      textColor: 'text-critical-400',
    },
    {
      id: 'sync',
      to: '/farmer/sync',
      title: 'Offline Sync Dashboard',
      description: 'Manage pending offline reports, view sync history, and trigger manual sync.',
      icon: RefreshCw,
      color: 'forest',
      borderColor: 'border-forest-500/30 hover:border-forest-500/60',
      bgColor: 'bg-forest-500/10',
      textColor: 'text-forest-400',
    },
    {
      id: 'vaccination',
      to: '/farmer/vaccination',
      title: t('vaccination'),
      description: 'Track immunization schedules and booster due dates in animal profile.',
      icon: Syringe,
      color: 'info',
      borderColor: 'border-info-500/30 hover:border-info-500/60',
      bgColor: 'bg-info-500/10',
      textColor: 'text-info-400',
    },
    {
      id: 'cases',
      to: '/farmer/cases',
      title: t('myCases'),
      description: 'Monitor filed reports and status badges (PENDING SYNC, SYNCED, REPORTED).',
      icon: ClipboardList,
      color: 'forest',
      borderColor: 'border-forest-500/30 hover:border-forest-500/60',
      bgColor: 'bg-forest-500/10',
      textColor: 'text-forest-400',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header Banner */}
      <Card variant="elevated" className="bg-gradient-to-r from-forest-950/50 to-slate-900/30 border-forest-500/30 p-6 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="forest" size="sm">Active Phase</Badge>
          <span className="text-xs text-slate-400">Authenticated as Farmer</span>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">
            Farmer Portal
          </h1>
          <p className="text-sm text-slate-300">
            Welcome, <span className="font-bold text-forest-400">{user?.full_name || 'Farmer'}</span>! Manage your livestock, file health reports, and work seamlessly offline.
          </p>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card variant="base" className="p-4 space-y-2 animate-fade-up animate-stagger-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registered Animals</span>
            <FolderHeart className="w-4 h-4 text-forest-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">—</p>
          <p className="text-xs text-slate-400">View in My Animals section</p>
        </Card>
        
        <Card variant="base" className="p-4 space-y-2 animate-fade-up animate-stagger-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pending Reports</span>
            <AlertTriangle className="w-4 h-4 text-alert-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">—</p>
          <p className="text-xs text-slate-400">Check Sync Dashboard</p>
        </Card>
        
        <Card variant="base" className="p-4 space-y-2 animate-fade-up animate-stagger-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Health Cases</span>
            <TrendingUp className="w-4 h-4 text-info-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100">—</p>
          <p className="text-xs text-slate-400">Review in My Cases</p>
        </Card>
      </div>

      {/* Services Grid */}
      <div className="space-y-4">
        <div className="section-header">
          <h2 className="section-title">Livestock Services</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service, idx) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.id}
                to={service.to}
                className={`group card-interactive border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 p-5 space-y-3 animate-fade-up ${
                  service.borderColor
                } animate-stagger-${(idx % 5) + 1}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 ${service.bgColor} rounded-xl group-hover:scale-110 transition-transform border ${service.borderColor} ${service.textColor}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 group-hover:text-forest-400 transition-colors text-base">
                    {service.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    {service.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4 animate-fade-up animate-stagger-5">
        <Button variant="primary" size="lg" icon={<Plus className="w-5 h-5" />}>
          <Link to="/farmer/animals/new" className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {t('registerNewAnimal')}
          </Link>
        </Button>
        <p className="text-xs text-slate-400">Or go to My Animals and click the register button</p>
      </div>
    </div>
  );
};

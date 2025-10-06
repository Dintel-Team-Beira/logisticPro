import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import PageContainer from '@/Components/PageContainer';
import Button from '@/Components/Button';
import ProtectedRoute from '@/Components/ProtectedRoute';
import { PERMISSIONS } from '@/config/permissions';
import { Ship, Plus } from 'lucide-react';

export default function Dashboard({ auth, stats }) {
    return (
        <AppLayout
            title="Dashboard"
            breadcrumbs={[
                { label: 'Dashboard', href: '/dashboard' }
            ]}
        >
            <ProtectedRoute permission={PERMISSIONS.VIEW_DASHBOARD}>
                <PageContainer
                    title="Dashboard"
                    description="Visão geral das suas operações"
                    actions={
                        <ProtectedRoute permission={PERMISSIONS.CREATE_SHIPMENTS}>
                            <Link href="/shipments/create">
                                <Button variant="primary" size="lg">
                                    <Plus className="w-5 h-5" />
                                    Novo Shipment Hello
                                </Button>
                            </Link>
                        </ProtectedRoute>
                    }
                >
                    {/* Seu conteúdo do dashboard aqui */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Stats cards, charts, etc */}
                    </div>
                </PageContainer>
            </ProtectedRoute>
        </AppLayout>
    );
}

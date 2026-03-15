import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Button from '../Button';
import Card from '../common/Card';
import { Bell, Shield, Radio, Send } from 'lucide-react';

const NotificationDebug = () => {
    const {
        permissionStatus,
        requestPermission,
        fcmToken,
        sendTestNotification,
        addNotification
    } = useNotifications();

    const copyToken = () => {
        if (fcmToken) {
            navigator.clipboard.writeText(fcmToken);
            addNotification('announcement', 'Token copied to clipboard!', true);
        }
    };

    return (
        <Card className="mt-8 border-orange-100 bg-orange-50/50">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <Bell size={20} />
                </div>
                <div>
                    <h3 className="font-black text-gray-900">Notification Debugger</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Developer Tools</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Permission Status */}
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-500">Permission</span>
                        <span className={`text-xs font-black uppercase px-2 py-1 rounded-lg ${permissionStatus === 'granted' ? 'bg-green-100 text-green-600' :
                                permissionStatus === 'denied' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                            }`}>
                            {permissionStatus}
                        </span>
                    </div>
                    {permissionStatus === 'default' && (
                        <Button onClick={requestPermission} size="sm" className="w-full">
                            Request Permission
                        </Button>
                    )}
                </div>

                {/* FCM Token */}
                <div className="bg-white p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-500">FCM Token</span>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${fcmToken ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            <span className="text-xs font-bold text-gray-400">{fcmToken ? 'Active' : 'Missing'}</span>
                        </div>
                    </div>
                    <Button
                        onClick={copyToken}
                        disabled={!fcmToken}
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                    >
                        {fcmToken ? 'Copy Token' : 'No Token Generated'}
                    </Button>
                </div>

                {/* Actions */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                    <Button
                        onClick={() => addNotification('marketing', 'Local Test: Marketing Message', true)}
                        variant="secondary"
                        size="sm"
                        className="gap-2"
                    >
                        <Radio size={16} /> Local Toast
                    </Button>
                    <Button
                        onClick={sendTestNotification}
                        variant="primary"
                        size="sm"
                        className="gap-2 shadow-lg shadow-orange-500/20"
                    >
                        <Send size={16} /> Cloud Push
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default NotificationDebug;

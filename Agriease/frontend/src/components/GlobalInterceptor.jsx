import { useEffect } from 'react';
import api from '../api/axios';
import { useNotifier } from '../context/NotificationContext';

const GlobalInterceptor = () => {
    const { notifyError } = useNotifier();

    useEffect(() => {
        const interceptor = api.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response) {
                    const message = error.response.data?.message || 'An unexpected error occurred.';
                    notifyError(message);

                    if (error.response.status === 401) {
                        console.error("401 Unauthorized:", error.response.data);
                        const isAuthEndpoint = error.config?.url?.includes("/auth/");
                        const currentPath = window.location.pathname;

                        if (!isAuthEndpoint && !currentPath.includes("/login") && !currentPath.includes("/register")) {
                            const stored = localStorage.getItem("user");
                            if (!stored) {
                                window.location.href = "/login";
                            }
                        }
                    }
                } else if (error.request) {
                    notifyError('No response from server. Please check your network connection.');
                } else {
                    notifyError('An error occurred while setting up the request.');
                }
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(interceptor);
        };
    }, [notifyError]);

    return null;
};

export default GlobalInterceptor;

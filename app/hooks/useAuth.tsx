'use client';

import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
	ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';

// 定义用户信息结构，约束用户数据格式
interface User {
	// 用户id
	id: number;
	// 用户邮箱
	email: string;
	// 用户姓名
	name: string;
}

// 认证状态结构（用户信息 / 是否认证 / 是否加载中），管理核心状态
interface AuthState {
	// 用户信息
	user: User | null;
	// 是否认证
	isAuthenticated: boolean;
	// 是否加载中
	isLoading: boolean;
}

// 登录参数结构（邮箱 / 密码），约束登录接口入参
interface LoginCredentials {
	// 邮箱
	email: string;
	// 密码
	password: string;
}

// 注册参数结构（继承登录参数 + 用户名），约束注册接口入参
interface RegisterCredentials extends LoginCredentials {
	// 用户名
	name: string;
}

// 认证接口返回值结构（用户信息 / 提示信息 / 错误信息），约束接口返回格式
interface AuthResponse {
	// 用户信息
	user: User;
	// 提示信息
	message?: string;
	// 错误信息
	error?: string;
}
// 认证上下文的类型（继承 AuthState + 登录 / 注册 / 登出 / 校验方法），约束 Context 值
interface AuthContextType extends AuthState {
	login: (credentials: LoginCredentials) => Promise<AuthResponse>;
	register: (credentials: RegisterCredentials) => Promise<AuthResponse>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;
}

// 创建认证上下文，默认值为undefined，用于传递认证状态和方法
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证上下文提供者，包裹子组件后，子组件可通过useAuth()获取上下文
export function AuthProvider({ children }: { children: ReactNode }) {
	const router = useRouter();
	const [authState, setAuthState] = useState<AuthState>({
		user: null,
		isAuthenticated: false,
		isLoading: true,
	});

	// 校验用户当前登录状态：调用/api/auth/me接口，更新认证状态（加载 / 认证 / 未认证）
	// 使用useCallback缓存函数，防止页面重新加载的时候checkAuth变化，导致useEffect重复执行
	const checkAuth = useCallback(async () => {

		try {
			const response = await fetch('/api/auth/me', {
				credentials: 'include',
			});

			if (response.ok) {
				const data = await response.json();
				setAuthState({
					user: data.user,
					isAuthenticated: true,
					isLoading: false,
				});
			} else {
				setAuthState({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
			}
		} catch {
			setAuthState({
				user: null,
				isAuthenticated: false,
				isLoading: false,
			});
		}
	}, []);

	useEffect(() => {
		setTimeout(() => {
			checkAuth();
		}, 0);
	}, [checkAuth]);


	// 登录逻辑：调用/api/auth/login接口，成功则更新全局认证状态，失败则抛错
	const login = useCallback(
		async (credentials: LoginCredentials): Promise<AuthResponse> => {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials),
				credentials: 'include',
			});

			const data: AuthResponse = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '登录失败');
			}

			setAuthState({
				user: data.user,
				isAuthenticated: true,
				isLoading: false,
			});

			return data;
		},
		[],
	);

	// 注册逻辑：调用/api/auth/register接口，成功则更新全局认证状态，失败则抛错
	const register = useCallback(
		async (credentials: RegisterCredentials): Promise<AuthResponse> => {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(credentials),
				credentials: 'include',
			});

			const data: AuthResponse = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '注册失败');
			}

			setAuthState({
				user: data.user,
				isAuthenticated: true,
				isLoading: false,
			});

			return data;
		},
		[],
	);

	// 登出逻辑：调用/api/auth/logout接口（失败也强制登出），重置认证状态并跳转登录页
	const logout = useCallback(async () => {
		try {
			await fetch('/api/auth/logout', {
				method: 'POST',
				credentials: 'include',
			});
		} catch {

		}

		setAuthState({
			user: null,
			isAuthenticated: false,
			isLoading: false,
		});
		router.push('/login');
	}, [router]);

	const value: AuthContextType = {
		...authState,
		login,
		register,
		logout,
		checkAuth,
	};

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

// 获取认证上下文，若未在AuthProvider内使用则抛错，保证 Hook 使用合法性
export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth 必须在 AuthProvider 内部使用');
	}
	return context;
}

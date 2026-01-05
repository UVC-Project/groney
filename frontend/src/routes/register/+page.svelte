<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { auth } from '$lib/stores/auth';
	import { API_BASE_URL } from '$lib/config';

	// Get registration type from URL params
	let registrationType = $derived(page.url.searchParams.get('type') || 'student');

	// Form state
	let firstName = $state('');
	let lastName = $state('');
	let username = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');

	// Teacher-specific fields
	let className = $state('');
	let schoolName = $state('');

	// Student-specific fields
	let classCode = $state('');

	let error = $state('');
	let isLoading = $state(false);

	function switchType(type: 'teacher' | 'student') {
		goto(`/register?type=${type}`);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';

		// Validation
		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 8) {
			error = 'Password must be at least 8 characters';
			return;
		}

		isLoading = true;

		let result;

		if (registrationType === 'teacher') {
			result = await auth.registerTeacher({
				firstName,
				lastName,
				username,
				email,
				password,
				className,
				schoolName,
			});
		} else {
			result = await auth.registerStudent({
				firstName,
				lastName,
				username,
				email,
				password,
				classCode,
			});
		}

		if (result.success) {
			// Auto-login after registration
			const loginResult = await auth.login(username, password);
			if (loginResult.success) {
				if (registrationType === 'teacher' && result.classId) {
					// Initialize the class with default sectors and missions
					try {
						const authState = await new Promise<{ token: string | null; user: { id: string; role: string } | null }>((resolve) => {
							auth.subscribe((state) => resolve({ token: state.token, user: state.user }))();
						});

						await fetch(`${API_BASE_URL}/api/teacher/initialize`, {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
								...(authState.user ? { 'x-user-id': authState.user.id, 'x-user-role': authState.user.role } : {}),
								...(authState.token ? { Authorization: `Bearer ${authState.token}` } : {}),
							},
							body: JSON.stringify({ classId: result.classId }),
						});
					} catch (initError) {
						console.error('Failed to initialize class:', initError);
						// Continue anyway - class was created, just without default data
					}
					goto('/teacher');
				} else if (registrationType === 'teacher') {
					goto('/teacher');
				} else {
					goto('/');
				}
			} else {
				// Registration succeeded but login failed, redirect to login
				goto('/login');
			}
		} else {
			error = result.error || 'Registration failed';
		}

		isLoading = false;
	}
</script>

<svelte:head>
	<title>Register - Green Schoolyard</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-4">
	<div class="w-full max-w-md">
		<!-- Logo/Header -->
		<div class="text-center mb-8">
			<div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/30">
				<span class="text-4xl">🌱</span>
			</div>
			<h1 class="text-3xl font-bold text-slate-800">Create Account</h1>
			<p class="text-slate-600 mt-2">Join the Green Schoolyard adventure!</p>
		</div>

		<!-- Type Selector -->
		<div class="flex gap-2 mb-6">
			<button
				onclick={() => switchType('teacher')}
				class="flex-1 py-3 px-4 rounded-lg font-semibold transition-all"
				class:bg-emerald-500={registrationType === 'teacher'}
				class:text-white={registrationType === 'teacher'}
				class:shadow-lg={registrationType === 'teacher'}
				class:bg-white={registrationType !== 'teacher'}
				class:text-slate-600={registrationType !== 'teacher'}
				class:border={registrationType !== 'teacher'}
				class:border-slate-200={registrationType !== 'teacher'}
			>
				👩‍🏫 Teacher
			</button>
			<button
				onclick={() => switchType('student')}
				class="flex-1 py-3 px-4 rounded-lg font-semibold transition-all"
				class:bg-blue-500={registrationType === 'student'}
				class:text-white={registrationType === 'student'}
				class:shadow-lg={registrationType === 'student'}
				class:bg-white={registrationType !== 'student'}
				class:text-slate-600={registrationType !== 'student'}
				class:border={registrationType !== 'student'}
				class:border-slate-200={registrationType !== 'student'}
			>
				👨‍🎓 Student
			</button>
		</div>

		<!-- Registration Form -->
		<div class="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
			<form onsubmit={handleSubmit} class="space-y-4">
				{#if error}
					<div class="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
						{error}
					</div>
				{/if}

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label for="firstName" class="block text-sm font-semibold text-slate-700 mb-2">
							First Name
						</label>
						<input
							type="text"
							id="firstName"
							bind:value={firstName}
							required
							class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
							placeholder="John"
						/>
					</div>
					<div>
						<label for="lastName" class="block text-sm font-semibold text-slate-700 mb-2">
							Last Name
						</label>
						<input
							type="text"
							id="lastName"
							bind:value={lastName}
							required
							class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
							placeholder="Doe"
						/>
					</div>
				</div>

				<div>
					<label for="username" class="block text-sm font-semibold text-slate-700 mb-2">
						Username
					</label>
					<input
						type="text"
						id="username"
						bind:value={username}
						required
						class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
						placeholder="johndoe"
					/>
				</div>

				{#if registrationType === 'teacher'}
				<div>
					<label for="email" class="block text-sm font-semibold text-slate-700 mb-2">
						Email
					</label>
					<input
						type="text"
						id="email"
						bind:value={email}
						required
						class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
						placeholder="johndoe@example.com"
					/>
				</div>
				
					<div>
						<label for="className" class="block text-sm font-semibold text-slate-700 mb-2">
							Class Name
						</label>
						<input
							type="text"
							id="className"
							bind:value={className}
							required
							class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
							placeholder="e.g., Grade 5A"
						/>
					</div>
					<div>
						<label for="schoolName" class="block text-sm font-semibold text-slate-700 mb-2">
							School Name
						</label>
						<input
							type="text"
							id="schoolName"
							bind:value={schoolName}
							required
							class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
							placeholder="e.g., Amsterdam Primary"
						/>
					</div>
				{:else}
					<div>
						<label for="classCode" class="block text-sm font-semibold text-slate-700 mb-2">
							Class Code
						</label>
						<input
							type="text"
							id="classCode"
							bind:value={classCode}
							required
							class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all uppercase"
							placeholder="e.g., ABC123"
						/>
						<p class="text-xs text-slate-500 mt-1">Ask your teacher for the class code</p>
					</div>
				{/if}

				<div>
					<label for="password" class="block text-sm font-semibold text-slate-700 mb-2">
						Password
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						required
						minlength="8"
						class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
						placeholder="Min. 8 characters"
					/>
				</div>

				<div>
					<label for="confirmPassword" class="block text-sm font-semibold text-slate-700 mb-2">
						Confirm Password
					</label>
					<input
						type="password"
						id="confirmPassword"
						bind:value={confirmPassword}
						required
						class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
						placeholder="Repeat your password"
					/>
				</div>

				<button
					type="submit"
					disabled={isLoading}
					class="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
				>
					{#if isLoading}
						<svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Creating account...
					{:else}
						Create Account
					{/if}
				</button>
			</form>

			<div class="mt-6 pt-6 border-t border-slate-200 text-center">
				<p class="text-slate-600">
					Already have an account?
					<a href="/login" class="text-emerald-600 font-semibold hover:underline">
						Sign in
					</a>
				</p>
			</div>
		</div>
	</div>
</div>

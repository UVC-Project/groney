<style>
  @keyframes slide-up {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slide-up 0.3s ease-out;
  }

  /* Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }

  /* Ensure minimum touch target size on mobile */
  @media (max-width: 768px) {
    button,
    select {
      min-height: 48px;
    }
  }
</style>

<script lang="ts">
  import type { PageData } from './$types';
  import type { Class, ClassListItem, Sector, Mission, Submission } from '$lib/types/teacher';
  import LoadingSkeleton from '$lib/components/LoadingSkeleton.svelte';
  import ErrorDisplay from '$lib/components/ErrorDisplay.svelte';
  import MapBuilder from '$lib/components/MapBuilder.svelte';
  import { API_BASE_URL } from '$lib/config';
  import { getAuthHeaders } from '$lib/auth/context';
  import { auth, user } from '$lib/stores/auth';
  import { invalidateAll, goto } from '$app/navigation';
  import { get } from 'svelte/store';

  let { data }: { data: PageData } = $props();
  
  // Reactive data from load function - updates when invalidateAll() is called
  let currentClassData = $derived(data.currentClass || null);
  let allClassesData = $derived(data.allClasses || []);
  let sectorsData = $derived(data.sectors || []);
  let loadError = $derived(data.error);
  
  // Local state for data that can be modified optimistically
  let missionsData = $state<Mission[]>(data.missions || []);
  let submissionsData = $state<Submission[]>(data.submissions || []);
  
  // Sync local state when data changes from server
  $effect(() => {
    missionsData = data.missions || [];
  });
  $effect(() => {
    submissionsData = data.submissions || [];
  });

  let activeTab = $state<'overview' | 'missions' | 'submissions' | 'map'>('overview');
  let isCreateClassDialogOpen = $state(false);
  let isCreateMissionDialogOpen = $state(false);
  let isCreateSectorDialogOpen = $state(false);
  let copySuccess = $state(false);
  let isClassSelectorOpen = $state(false);
  let isSwitchingClass = $state(false);
  let isCreatingMission = $state(false);
  let isCreatingClass = $state(false);
  let isCreatingSector = $state(false);
  let submissionsView = $state<'grid' | 'list'>('grid');
  let reviewingSubmissionId = $state<string | null>(null);
  let missionFormErrors = $state<Record<string, string>>({});
  let sectorFormErrors = $state<Record<string, string>>({});
  
  // Map builder state
  let isMapEditMode = $state(false);
  let isSavingMap = $state(false);
  
  // Sector edit dialog state
  let editingSector = $state<{ id: string; name: string; type: string } | null>(null);
  let editingSectorName = $state<string>('');
  let editSectorInputRef = $state<HTMLInputElement | null>(null);
  
  // Toast notification state
  let toastMessage = $state<string>('');
  let toastType = $state<'success' | 'error'>('success');
  let toastVisible = $state(false);

  // Focus management for accessibility
  let createClassDialogRef = $state<HTMLDivElement | null>(null);
  let createMissionDialogRef = $state<HTMLDivElement | null>(null);

  // Class form state
  let classForm = $state({
    className: '',
    schoolName: '',
  });

  // Sector form state
  let sectorForm = $state({
    name: '',
    type: 'TREES' as 'TREES' | 'FLOWERS' | 'POND' | 'ANIMALS' | 'GARDEN' | 'PLAYGROUND' | 'COMPOST' | 'OTHER',
  });

  // Mission form state
  let missionForm = $state({
    sectorId: '',
    title: '',
    description: '',
    xpReward: 10,
    coinReward: 5,
    thirstBoost: 0,
    hungerBoost: 0,
    happinessBoost: 0,
    cleanlinessBoost: 0,
  });

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'missions' as const, label: 'Missions', icon: '🎯' },
    { id: 'submissions' as const, label: 'Submissions', icon: '📝' },
    { id: 'map' as const, label: 'Map', icon: '🗺️' },
  ];

  // Computed values
  let hasMultipleClasses = $derived(allClassesData.length > 1);
  let currentClassId = $derived(currentClassData?.id || '');
  
  // Helper function to get sector display properties
  function getSectorDisplay(type: string) {
    const displays: Record<string, { icon: string; color: string }> = {
      TREES: { icon: '\u{1F333}', color: 'emerald' },
      FLOWERS: { icon: '\u{1F338}', color: 'pink' },
      POND: { icon: '\u{1F986}', color: 'blue' },
      ANIMALS: { icon: '\u{1F43E}', color: 'amber' },
      GARDEN: { icon: '\u{1F955}', color: 'orange' },
      PLAYGROUND: { icon: '\u{1F3AA}', color: 'purple' },
      COMPOST: { icon: '\u{267B}\u{FE0F}', color: 'lime' },
      OTHER: { icon: '\u{1F4CD}', color: 'slate' },
      CHICKENS: { icon: '\u{1F414}', color: 'amber' },
    };
    return displays[type.toUpperCase()] || { icon: '\u{1F331}', color: 'green' };
  }

  // Toast notification function
  function showToast(message: string, type: 'success' | 'error' = 'success') {
    toastMessage = message;
    toastType = type;
    toastVisible = true;
    
    setTimeout(() => {
      toastVisible = false;
    }, 3000);
  }

  // Group missions by sector
  let missionsBySector = $derived(
    sectorsData.map((sector) => {
      const display = getSectorDisplay(sector.type);
      return {
        ...sector,
        icon: display.icon,
        color: display.color,
        missions: missionsData.filter((m) => m.sectorId === sector.id),
      };
    })
  );

  // Map sectors data with grid positions
  let mapSectorsData = $derived(
    sectorsData.map((sector, index) => {
      const display = getSectorDisplay(sector.type);
      const mapped = {
        ...sector,
        icon: display.icon,
        color: display.color,
        // Use stored grid position or calculate default position
        gridX: sector.gridX ?? (index % 4) * 4,
        gridY: sector.gridY ?? Math.floor(index / 4) * 4,
        gridWidth: sector.gridWidth ?? 3,
        gridHeight: sector.gridHeight ?? 3,
        missions: missionsData.filter((m) => m.sectorId === sector.id),
      };
      return mapped;
    })
  );
  
  // Debug: log when sectors data changes
  $effect(() => {
    console.log('📍 Sectors data updated:', sectorsData.length, 'sectors');
  });

  // Sector color hex values for styling
  function getSectorColorHex(type: string): string {
    const colors: Record<string, string> = {
      TREES: '#22c55e',
      FLOWERS: '#ec4899',
      POND: '#3b82f6',
      ANIMALS: '#f59e0b',
      GARDEN: '#f97316',
      PLAYGROUND: '#a855f7',
      COMPOST: '#84cc16',
      OTHER: '#64748b',
      CHICKENS: '#f59e0b',
    };
    return colors[type?.toUpperCase()] || '#64748b';
  }

  // Map builder handlers
  async function handleSectorMove(sectorId: string, x: number, y: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/sectors/${sectorId}/position`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ gridX: x, gridY: y }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sector position');
      }

      await invalidateAll();
    } catch (error) {
      console.error('Failed to move sector:', error);
      showToast('Failed to update sector position', 'error');
    }
  }

  async function handleSectorResize(sectorId: string, width: number, height: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/sectors/${sectorId}/position`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ gridWidth: width, gridHeight: height }),
      });

      if (!response.ok) {
        throw new Error('Failed to update sector size');
      }

      await invalidateAll();
    } catch (error) {
      console.error('Failed to resize sector:', error);
      showToast('Failed to update sector size', 'error');
    }
  }

  async function handleMapResize(width: number, height: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/map-size`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ mapWidth: width, mapHeight: height }),
      });

      if (!response.ok) {
        throw new Error('Failed to update map size');
      }

      await invalidateAll();
    } catch (error) {
      console.error('Failed to resize map:', error);
      showToast('Failed to update map size', 'error');
    }
  }

  function handleMapSectorClick(sector: any) {
    // Could open a sector detail modal or switch to missions tab filtered by sector
    console.log('Clicked sector:', sector.name);
    showToast(`Selected: ${sector.name}`, 'success');
  }

  async function handleAddSectorFromMap(type: string, x: number, y: number) {
    // Generate a name based on type and count
    const existingOfType = sectorsData.filter(s => s.type.toUpperCase() === type.toUpperCase());
    const sectorNames: Record<string, string> = {
      TREES: 'Forest Area',
      FLOWERS: 'Flower Garden',
      POND: 'Pond',
      ANIMALS: 'Animal Area',
      GARDEN: 'Vegetable Garden',
      PLAYGROUND: 'Playground',
      COMPOST: 'Compost Area',
      OTHER: 'Custom Area',
    };
    const baseName = sectorNames[type] || 'New Sector';
    const name = existingOfType.length > 0 ? `${baseName} ${existingOfType.length + 1}` : baseName;

    // Get current class ID from localStorage or current class data
    const classId = localStorage.getItem('teacher_selected_class_id') || currentClassData?.id;

    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/sectors${classId ? `?classId=${classId}` : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          name,
          type,
          gridX: x,
          gridY: y,
          gridWidth: 3,
          gridHeight: 3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create sector');
      }

      const newSector = await response.json();
      console.log('Created sector:', newSector);

      showToast(`${name} added to map! 🎉`, 'success');
      
      // Force page data refresh by invalidating all load functions
      // Use a small delay to ensure the backend has committed the transaction
      setTimeout(async () => {
        await invalidateAll();
      }, 100);
    } catch (error) {
      console.error('Failed to add sector:', error);
      showToast('Failed to add sector. Please try again.', 'error');
    }
  }

  // Handler for placing existing unplaced sectors on the map
  async function handlePlaceSector(sectorId: string, x: number, y: number) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/sectors/${sectorId}/position`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ gridX: x, gridY: y }),
      });

      if (!response.ok) {
        throw new Error('Failed to place sector on map');
      }

      const sector = sectorsData.find(s => s.id === sectorId);
      showToast(`${sector?.name || 'Sector'} placed on map! 🎉`, 'success');
      
      await invalidateAll();
    } catch (error) {
      console.error('Failed to place sector:', error);
      showToast('Failed to place sector. Please try again.', 'error');
    }
  }

  // Handler for renaming a sector
  async function handleSectorRename(sectorId: string, newName: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/sectors/${sectorId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!response.ok) {
        throw new Error('Failed to rename sector');
      }

      showToast(`Sector renamed to "${newName}" 📝`, 'success');
      await invalidateAll();
    } catch (error) {
      console.error('Failed to rename sector:', error);
      showToast('Failed to rename sector. Please try again.', 'error');
    }
  }

  // Handler for removing a sector from the map (moves it back to palette)
  async function handleSectorRemoveFromMap(sectorId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/sectors/${sectorId}/position`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ gridX: -1, gridY: -1 }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove sector from map');
      }

      showToast('Sector removed from map 📤', 'success');
      await invalidateAll();
    } catch (error) {
      console.error('Failed to remove sector from map:', error);
      showToast('Failed to remove sector from map. Please try again.', 'error');
    }
  }

  // Handler for opening the sector edit dialog
  function handleSectorEdit(sector: { id: string; name: string; type: string }) {
    editingSector = sector;
    editingSectorName = sector.name;
    
    // Focus the input after the dialog opens
    setTimeout(() => {
      editSectorInputRef?.focus();
      editSectorInputRef?.select();
    }, 100);
  }

  // Handler for saving sector name changes
  async function handleSectorEditSubmit() {
    if (!editingSector || !editingSectorName.trim()) return;
    
    await handleSectorRename(editingSector.id, editingSectorName.trim());
    closeSectorEditDialog();
  }

  // Handler for removing sector from map via edit dialog
  async function handleSectorEditRemove() {
    if (!editingSector) return;
    
    const confirmed = confirm(`Remove "${editingSector.name}" from the map?\n\nThe sector will be moved back to the palette and can be placed again later.`);
    if (confirmed) {
      await handleSectorRemoveFromMap(editingSector.id);
      closeSectorEditDialog();
    }
  }

  // Handler for deleting sector via edit dialog
  async function handleSectorEditDelete() {
    if (!editingSector) return;
    
    const confirmed = confirm(`Permanently delete "${editingSector.name}"?\n\nThis will also delete all missions in this sector. This action cannot be undone.`);
    if (confirmed) {
      await handleDeleteSector(editingSector.id);
      closeSectorEditDialog();
    }
  }

  // Close the sector edit dialog
  function closeSectorEditDialog() {
    editingSector = null;
    editingSectorName = '';
  }

  function handleLogout() {
    auth.logout();
    goto('/login');
  }

  function copyClassCode() {
    if (!currentClassData?.classCode) return;
    navigator.clipboard.writeText(currentClassData.classCode).then(() => {
      copySuccess = true;
      setTimeout(() => {
        copySuccess = false;
      }, 2000);
    });
  }

  function openCreateClassDialog() {
    isCreateClassDialogOpen = true;
    // Focus the dialog after it opens
    setTimeout(() => {
      createClassDialogRef?.focus();
    }, 100);
  }

  function closeCreateClassDialog() {
    isCreateClassDialogOpen = false;
    // Reset form when dialog is closed
    classForm = {
      className: '',
      schoolName: '',
    };
  }

  function handleDialogKeydown(event: KeyboardEvent, closeHandler: () => void) {
    if (event.key === 'Escape') {
      closeHandler();
    }
  }

  async function handleCreateClass(event: Event) {
    event.preventDefault();
    
    if (!classForm.className || !classForm.schoolName) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    isCreatingClass = true;

    try {
      // Call API endpoint with authentication
      const response = await fetch(`${API_BASE_URL}/api/teacher/create-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          className: classForm.className,
          schoolName: classForm.schoolName,
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create class');
      }

      const newClass = await response.json();
      console.log('✅ Created class:', newClass);

      // Initialize the class with sectors and missions
      await initializeClass(newClass.id);
      
      // Automatically switch to the newly created class
      await switchToNewClass(newClass.id);
      
      // Show success toast
      showToast(`Class "${newClass.name}" created successfully! 🎉`, 'success');
      
      // Reset form
      classForm = {
        className: '',
        schoolName: '',
      };
      
      closeCreateClassDialog();
      
      // Refresh data without full page reload
      await invalidateAll();
    } catch (error) {
      console.error('❌ Failed to create class:', error);
      showToast('Failed to create class. Please try again.', 'error');
    } finally {
      isCreatingClass = false;
    }
  }

  async function initializeClass(classId: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ classId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to initialize class');
      }

      console.log('✅ Class initialized with sectors and missions');
    } catch (error) {
      console.error('❌ Failed to initialize class:', error);
      showToast('Class created but failed to initialize. Please try refreshing.', 'error');
    }
  }

  function toggleClassSelector() {
    isClassSelectorOpen = !isClassSelectorOpen;
  }

  function closeClassSelector() {
    isClassSelectorOpen = false;
  }

  async function switchClass(classId: string) {
    if (classId === currentClassId || isSwitchingClass) return;

    isSwitchingClass = true;
    closeClassSelector();

    try {
      // Call API to switch active class with authentication
      const response = await fetch(`${API_BASE_URL}/api/teacher/switch-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ classId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to switch class');
      }

      console.log('✅ Switched to class:', classId);

      // Save selected class to localStorage for persistence
      localStorage.setItem('teacher_selected_class_id', classId);

      // Refresh data without full page reload
      await invalidateAll();
    } catch (error) {
      console.error('❌ Failed to switch class:', error);
      showToast('Failed to switch class. Please try again.', 'error');
    } finally {
      isSwitchingClass = false;
    }
  }

  async function switchToNewClass(classId: string) {
    try {
      // Call API to switch active class with authentication
      const response = await fetch(`${API_BASE_URL}/api/teacher/switch-class`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ classId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to switch to new class');
      }

      console.log('✅ Automatically switched to new class:', classId);

      // Save selected class to localStorage for persistence
      localStorage.setItem('teacher_selected_class_id', classId);
    } catch (error) {
      console.error('❌ Failed to switch to new class:', error);
      // Don't show error toast here as it would interfere with the success message
      // The class was created successfully, just the auto-switch failed
    }
  }

  function openCreateMissionDialog() {
    isCreateMissionDialogOpen = true;
    // Focus the dialog after it opens
    setTimeout(() => {
      createMissionDialogRef?.focus();
    }, 100);
  }

  function closeCreateMissionDialog() {
    isCreateMissionDialogOpen = false;
    // Reset form
    missionForm = {
      sectorId: '',
      title: '',
      description: '',
      xpReward: 10,
      coinReward: 5,
      thirstBoost: 0,
      hungerBoost: 0,
      happinessBoost: 0,
      cleanlinessBoost: 0,
    };
    // Clear errors
    missionFormErrors = {};
  }

  function validateMissionForm(): boolean {
    missionFormErrors = {};
    let isValid = true;

    if (!missionForm.sectorId) {
      missionFormErrors.sectorId = 'Please select a sector';
      isValid = false;
    }
    if (!missionForm.title || missionForm.title.length < 3) {
      missionFormErrors.title = 'Title must be at least 3 characters';
      isValid = false;
    }
    if (!missionForm.description || missionForm.description.length < 10) {
      missionFormErrors.description = 'Description must be at least 10 characters';
      isValid = false;
    }

    return isValid;
  }

  async function handleCreateMission(event: Event) {
    event.preventDefault();
    
    // Validate form
    if (!validateMissionForm()) {
      showToast('Please fix the form errors', 'error');
      return;
    }

    isCreatingMission = true;

    try {
      // Call API endpoint with authentication
      const response = await fetch(`${API_BASE_URL}/api/teacher/missions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(missionForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create mission');
      }

      const newMission = await response.json();
      
      // Add new mission to local state
      missionsData = [...missionsData, newMission];
      
      console.log('✅ Created mission:', newMission);
      
      // Show success toast
      showToast('Mission created successfully! 🎯', 'success');
      
      closeCreateMissionDialog();
    } catch (error) {
      console.error('❌ Failed to create mission:', error);
      showToast('Failed to create mission. Please try again.', 'error');
    } finally {
      isCreatingMission = false;
    }
  }

  // Sector dialog functions
  function openCreateSectorDialog() {
    isCreateSectorDialogOpen = true;
  }

  function closeCreateSectorDialog() {
    isCreateSectorDialogOpen = false;
    // Reset form
    sectorForm = {
      name: '',
      type: 'TREES',
    };
    // Clear errors
    sectorFormErrors = {};
  }

  function validateSectorForm(): boolean {
    sectorFormErrors = {};
    let isValid = true;

    if (!sectorForm.name || sectorForm.name.length < 2) {
      sectorFormErrors.name = 'Sector name must be at least 2 characters';
      isValid = false;
    }
    if (!sectorForm.type) {
      sectorFormErrors.type = 'Please select a sector type';
      isValid = false;
    }

    return isValid;
  }

  async function handleCreateSector(event: Event) {
    event.preventDefault();
    
    // Validate form
    if (!validateSectorForm()) {
      showToast('Please fix the form errors', 'error');
      return;
    }

    isCreatingSector = true;

    try {
      // Get current class ID from localStorage or current class data
      const classId = localStorage.getItem('teacher_selected_class_id') || currentClassData?.id;
      
      // Call API endpoint with authentication and classId
      const response = await fetch(`${API_BASE_URL}/api/teacher/sectors${classId ? `?classId=${classId}` : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify(sectorForm)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create sector');
      }

      const newSector = await response.json();
      
      console.log('✅ Created sector:', newSector);
      
      // Show success toast
      showToast('Sector created successfully! 🌱', 'success');
      
      closeCreateSectorDialog();
      
      // Refresh data to show new sector
      await invalidateAll();
    } catch (error) {
      console.error('❌ Failed to create sector:', error);
      showToast('Failed to create sector. Please try again.', 'error');
    } finally {
      isCreatingSector = false;
    }
  }

  let deletingSectorId = $state<string | null>(null);

  async function handleDeleteSector(sectorId: string) {
    if (deletingSectorId) return;

    const sector = sectorsData.find(s => s.id === sectorId);
    const sectorName = sector?.name || 'Unknown sector';

    const confirmed = confirm(`Are you sure you want to delete "${sectorName}"? This will also delete all missions in this sector.`);
    if (!confirmed) return;

    deletingSectorId = sectorId;

    try {
      const response = await fetch(`${API_BASE_URL}/api/teacher/sectors/${sectorId}`, {
        method: 'DELETE',
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete sector');
      }

      const result = await response.json();
      console.log('Deleted sector:', result);

      showToast(`Sector deleted successfully!`, 'success');
      await invalidateAll();
    } catch (error) {
      console.error('❌ Failed to delete sector:', error);
      showToast('Failed to delete sector. Please try again.', 'error');
    } finally {
      deletingSectorId = null;
    }
  }

  async function retryLoadData() {
    loadError = undefined;
    await invalidateAll();
  }

  async function handleApproveSubmission(submissionId: string) {
    if (reviewingSubmissionId) return; // Prevent multiple simultaneous reviews

    reviewingSubmissionId = submissionId;

    // Store original state for rollback
    const originalSubmissions = [...submissionsData];

    try {
      // Optimistic update: Remove submission from list immediately
      submissionsData = submissionsData.filter((s) => s.id !== submissionId);

      // Call API endpoint with authentication
      const response = await fetch(`${API_BASE_URL}/api/teacher/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: 'completed' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to approve submission');
      }

      console.log('Approved submission:', submissionId);

      // Show success toast
      showToast('Submission approved successfully! 🎉', 'success');
      
      // TODO: Refresh mascot stats (pending backend implementation)
    } catch (error) {
      console.error('❌ Failed to approve submission:', error);
      // Rollback on error
      submissionsData = originalSubmissions;
      // Show error toast
      showToast('Failed to approve submission. Please try again.', 'error');
    } finally {
      reviewingSubmissionId = null;
    }
  }

  async function handleRejectSubmission(submissionId: string) {
    if (reviewingSubmissionId) return; // Prevent multiple simultaneous reviews

    reviewingSubmissionId = submissionId;

    // Store original state for rollback
    const originalSubmissions = [...submissionsData];

    try {
      // Optimistic update: Remove submission from list immediately
      submissionsData = submissionsData.filter((s) => s.id !== submissionId);

      // Call API endpoint with authentication
      const response = await fetch(`${API_BASE_URL}/api/teacher/submissions/${submissionId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reject submission');
      }

      console.log('Rejected submission:', submissionId);

      // Show success toast
      showToast('Submission rejected.', 'success');
    } catch (error) {
      console.error('❌ Failed to reject submission:', error);
      // Rollback on error
      submissionsData = originalSubmissions;
      // Show error toast
      showToast('Failed to reject submission. Please try again.', 'error');
    } finally {
      reviewingSubmissionId = null;
    }
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/40 font-teacher">
  <!-- Header -->
  <header class="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-40 shadow-sm">
    <div class="container mx-auto px-4 lg:px-6 py-4">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span class="text-white text-xl">🌱</span>
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-xl sm:text-2xl font-bold text-slate-800 truncate">
              Teacher Dashboard
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 hidden sm:block">
              Welcome, {$user?.firstName || 'Teacher'}!
            </p>
          </div>
        </div>

        <!-- Class Selector (only visible with multiple classes) -->
        {#if hasMultipleClasses}
          <div class="relative">
            <button
              onclick={toggleClassSelector}
              class="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-medium transition-all min-h-touch-target"
              aria-label="Select class"
              aria-expanded={isClassSelectorOpen}
              aria-haspopup="listbox"
              disabled={isSwitchingClass}
            >
              <svg class="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <div class="flex flex-col items-start min-w-0">
                <span class="text-xs text-slate-500 hidden sm:block">Current Class</span>
                <span class="text-sm font-semibold truncate max-w-[120px] sm:max-w-[200px]">
                  {#if isSwitchingClass}
                    <span class="inline-flex items-center gap-1">
                      <svg class="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </span>
                  {:else}
                    {currentClassData?.name} - {currentClassData?.school}
                  {/if}
                </span>
              </div>
              <svg
                class="w-4 h-4 text-slate-600 transition-transform"
                class:rotate-180={isClassSelectorOpen}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            {#if isClassSelectorOpen}
              <div
                class="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                role="listbox"
                aria-label="Select a class"
              >
                <div class="px-3 py-2 border-b border-slate-200">
                  <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Your Classes</p>
                </div>
                <div class="max-h-64 overflow-y-auto">
                  {#each allClassesData as classItem}
                    <button
                      onclick={() => switchClass(classItem.id)}
                      class="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group"
                      class:bg-emerald-50={classItem.id === currentClassId}
                      role="option"
                      aria-selected={classItem.id === currentClassId}
                      onkeydown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          switchClass(classItem.id);
                        } else if (e.key === 'Escape') {
                          closeClassSelector();
                        }
                      }}
                    >
                      <div class="flex-1 min-w-0">
                        <p class="font-semibold text-slate-800 truncate">{classItem.name}</p>
                        <p class="text-sm text-slate-500 truncate">{classItem.school}</p>
                      </div>
                      {#if classItem.id === currentClassId}
                        <svg class="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                      {/if}
                    </button>
                  {/each}
                </div>
              </div>

              <!-- Backdrop to close dropdown -->
              <div
                class="fixed inset-0 z-40"
                onclick={closeClassSelector}
                onkeydown={(e) => e.key === 'Escape' && closeClassSelector()}
                role="presentation"
                tabindex="-1"
              ></div>
            {/if}
          </div>
        {/if}

        <button
          onclick={handleLogout}
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all min-h-touch-target flex-shrink-0 hover:shadow-md"
          aria-label="Logout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span class="hidden sm:inline">Logout</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Tab Navigation -->
  <nav class="bg-white/60 backdrop-blur-sm border-b border-slate-200/60 sticky top-[72px] z-30">
    <div class="container mx-auto px-4 lg:px-6">
      <div class="flex gap-1 overflow-x-auto scrollbar-hide">
        {#each tabs as tab}
          <button
            onclick={() => (activeTab = tab.id)}
            class="relative flex items-center gap-2 px-4 sm:px-6 py-3.5 font-medium transition-all min-h-touch-target whitespace-nowrap group"
            class:text-emerald-600={activeTab === tab.id}
            class:text-slate-600={activeTab !== tab.id}
            class:hover:text-slate-900={activeTab !== tab.id}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            <span class="text-lg transition-transform group-hover:scale-110">{tab.icon}</span>
            <span class="text-sm sm:text-base font-semibold">{tab.label}</span>
            {#if activeTab === tab.id}
              <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"></div>
            {/if}
          </button>
        {/each}
      </div>
    </div>
  </nav>

  <!-- Main Content -->
  <main class="container mx-auto px-4 lg:px-6 py-6 sm:py-8 max-w-7xl">
    <!-- Welcome State for New Teachers (No Class) -->
    {#if !currentClassData && !loadError}
      <div class="max-w-2xl mx-auto">
        <div class="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-xl border-2 border-emerald-200 p-8 sm:p-12 text-center">
          <div class="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span class="text-4xl">🌱</span>
          </div>
          <h2 class="text-3xl font-bold text-slate-800 mb-4">Welcome to Your Teacher Dashboard!</h2>
          <p class="text-lg text-slate-600 mb-8">
            Let's get started by creating your first class. You'll be able to manage missions, review student submissions, and track your class mascot's progress.
          </p>
          <button
            onclick={openCreateClassDialog}
            class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-lg font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:scale-105"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Your First Class</span>
          </button>
          <div class="mt-8 pt-8 border-t border-emerald-200">
            <p class="text-sm text-slate-500 mb-4">What you can do with your dashboard:</p>
            <div class="grid sm:grid-cols-3 gap-4 text-left">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-lg">🎯</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-700">Create Missions</p>
                  <p class="text-xs text-slate-500">Set tasks for students</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-lg">📝</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-700">Review Work</p>
                  <p class="text-xs text-slate-500">Approve submissions</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span class="text-lg">🐾</span>
                </div>
                <div>
                  <p class="text-sm font-semibold text-slate-700">Track Progress</p>
                  <p class="text-xs text-slate-500">Watch mascot grow</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    {:else if loadError}
      <!-- Error Display (only for actual errors, not missing class) -->
      <div class="mb-6">
        <ErrorDisplay message={loadError} onRetry={retryLoadData} />
      </div>
    {/if}

    {#if currentClassData && activeTab === 'overview'}
      <div class="space-y-6">
        <!-- Class Info Card -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          <div class="bg-gradient-to-r from-emerald-500 to-teal-600 px-4 sm:px-6 py-5">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 text-white/90 text-sm font-medium mb-1">
                  <svg class="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                  </svg>
                  <span>{currentClassData?.name || 'No Class'}</span>
                </div>
                <h2 class="text-xl sm:text-2xl font-bold text-white truncate">{currentClassData?.school || 'No School'}</h2>
              </div>
              <button
                onclick={openCreateClassDialog}
                class="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg font-medium transition-all min-h-touch-target border border-white/20 flex items-center gap-2 justify-center whitespace-nowrap"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>New Class</span>
              </button>
            </div>
          </div>
          
          <div class="p-4 sm:p-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div class="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-xl border border-blue-200 flex-1 sm:flex-initial">
                <code class="text-blue-900 font-mono text-base sm:text-lg font-bold tracking-wider">{currentClassData?.classCode || 'N/A'}</code>
              </div>
              <button
                onclick={copyClassCode}
                class="p-2.5 hover:bg-slate-100 rounded-lg transition-colors min-h-touch-target flex items-center justify-center gap-2 sm:gap-0"
                aria-label="Copy class code"
              >
                {#if copySuccess}
                  <svg class="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span class="text-sm text-emerald-600 sm:hidden">Copied!</span>
                {:else}
                  <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span class="text-sm text-slate-600 sm:hidden">Copy</span>
                {/if}
              </button>
            </div>
            <p class="text-sm text-slate-600">Share this code with students to join your class</p>
          </div>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <!-- Students Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-medium text-slate-600">Students</p>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-blue-600">{currentClassData?.students.length || 0}</p>
          </div>

          <!-- Mascot Level Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-medium text-slate-600">Level</p>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-emerald-600">{currentClassData?.mascot.level || 0}</p>
          </div>

          <!-- Total XP Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-medium text-slate-600">Total XP</p>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-purple-600">{currentClassData?.mascot.xp || 0}</p>
          </div>

          <!-- Coins Card -->
          <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 p-4 sm:p-5 hover:shadow-lg transition-shadow">
            <div class="flex items-center gap-2 sm:gap-3 mb-2">
              <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                </svg>
              </div>
              <p class="text-xs sm:text-sm font-medium text-slate-600">Coins</p>
            </div>
            <p class="text-2xl sm:text-3xl font-bold text-amber-600">{currentClassData?.mascot.coins || 0}</p>
          </div>
        </div>

        <!-- Students List -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
          <div class="px-4 sm:px-6 py-5 border-b border-slate-200/60">
            <h3 class="text-lg font-bold text-slate-800">Students</h3>
            <p class="text-sm text-slate-600 mt-1">
              {currentClassData?.students.length || 0} student{(currentClassData?.students.length || 0) !== 1 ? 's' : ''} in your class
            </p>
          </div>
          <div class="p-4 sm:p-6 space-y-3">
            {#each currentClassData?.students || [] as student}
              <div class="flex items-center justify-between p-3 sm:p-4 bg-slate-50/80 rounded-xl hover:bg-slate-100/80 transition-colors">
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-slate-800 truncate">{student.firstName} {student.lastName}</p>
                  <p class="text-sm text-slate-500 truncate">@{student.username}</p>
                </div>
                <span
                  class="px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ml-2"
                  class:bg-emerald-100={student.role === 'teacher'}
                  class:text-emerald-700={student.role === 'teacher'}
                  class:bg-blue-100={student.role === 'student'}
                  class:text-blue-700={student.role === 'student'}
                >
                  {student.role}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    {:else if currentClassData && activeTab === 'missions'}
      <div class="space-y-6">
        <!-- Header with Create Mission Button -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">Missions</h2>
            <p class="text-sm text-slate-600 mt-1">Manage tasks for your students</p>
          </div>
          <button
            onclick={openCreateMissionDialog}
            class="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 min-h-touch-target"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Mission</span>
          </button>
        </div>

        <!-- Missions Grouped by Sector -->
        {#each missionsBySector as sector}
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
            <!-- Sector Header -->
            <div class="px-4 sm:px-6 py-4 border-b border-slate-200/60 bg-gradient-to-r from-{sector.color}-50 to-{sector.color}-100/50">
              <div class="flex items-center gap-3">
                <span class="text-3xl">{sector.icon}</span>
                <div class="flex-1 min-w-0">
                  <h3 class="text-lg font-bold text-slate-800">{sector.name}</h3>
                  <p class="text-sm text-slate-600">{sector.description}</p>
                </div>
                <span class="px-3 py-1 bg-white/80 rounded-full text-sm font-semibold text-slate-700">
                  {sector.missions.length} mission{sector.missions.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <!-- Missions List -->
            <div class="p-4 sm:p-6">
              {#if sector.missions.length > 0}
                <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {#each sector.missions as mission}
                    <div class="bg-slate-50/80 rounded-xl p-4 border border-slate-200 hover:border-{sector.color}-300 hover:shadow-md transition-all">
                      <h4 class="font-semibold text-slate-800 mb-2">{mission.title}</h4>
                      <p class="text-sm text-slate-600 mb-4 line-clamp-2">{mission.description}</p>

                      <!-- Rewards -->
                      <div class="flex flex-wrap gap-2 mb-3">
                        <span class="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-md text-xs font-semibold">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          {mission.xpReward} XP
                        </span>
                        <span class="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-semibold">
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clip-rule="evenodd" />
                          </svg>
                          {mission.coinReward}
                        </span>
                      </div>

                      <!-- Stat Boosts -->
                      {#if mission.thirstBoost > 0 || mission.hungerBoost > 0 || mission.happinessBoost > 0 || mission.cleanlinessBoost > 0}
                        <div class="flex flex-wrap gap-1.5 text-xs">
                          {#if mission.thirstBoost > 0}
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded">
                              💧 +{mission.thirstBoost}
                            </span>
                          {/if}
                          {#if mission.hungerBoost > 0}
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-50 text-orange-700 rounded">
                              🍎 +{mission.hungerBoost}
                            </span>
                          {/if}
                          {#if mission.happinessBoost > 0}
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded">
                              😊 +{mission.happinessBoost}
                            </span>
                          {/if}
                          {#if mission.cleanlinessBoost > 0}
                            <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded">
                              ✨ +{mission.cleanlinessBoost}
                            </span>
                          {/if}
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              {:else}
                <div class="text-center py-8">
                  <div class="text-4xl mb-2">{sector.icon}</div>
                  <p class="text-slate-500">No missions yet for {sector.name}</p>
                  <p class="text-sm text-slate-400 mt-1">Click "Create Mission" to add one</p>
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    {:else if currentClassData && activeTab === 'submissions'}
      <div class="space-y-6">
        <!-- Header with View Toggle -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">Pending Submissions</h2>
            <p class="text-sm text-slate-600 mt-1">Review and approve student mission submissions</p>
          </div>
          
          <!-- View Toggle -->
          <div class="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
            <button
              onclick={() => (submissionsView = 'grid')}
              class="flex items-center gap-2 px-3 py-2 rounded-md transition-all min-h-touch-target"
              class:bg-white={submissionsView === 'grid'}
              class:shadow-sm={submissionsView === 'grid'}
              class:text-slate-900={submissionsView === 'grid'}
              class:text-slate-600={submissionsView !== 'grid'}
              aria-label="Grid view"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span class="hidden sm:inline text-sm font-medium">Grid</span>
            </button>
            <button
              onclick={() => (submissionsView = 'list')}
              class="flex items-center gap-2 px-3 py-2 rounded-md transition-all min-h-touch-target"
              class:bg-white={submissionsView === 'list'}
              class:shadow-sm={submissionsView === 'list'}
              class:text-slate-900={submissionsView === 'list'}
              class:text-slate-600={submissionsView !== 'list'}
              aria-label="List view"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span class="hidden sm:inline text-sm font-medium">List</span>
            </button>
          </div>
        </div>

        <!-- Submissions List -->
        {#if submissionsData.length > 0}
          {#if submissionsView === 'grid'}
            <!-- Grid View -->
            <div class="grid gap-6 lg:grid-cols-2">
            {#each submissionsData as submission}
              <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 overflow-hidden">
                <!-- Submission Photo -->
                <div class="relative aspect-video bg-slate-100">
                  <img
                    src={submission.photoUrl}
                    alt="{submission.mission.title} by {submission.student.firstName}"
                    class="w-full h-full object-cover"
                  />
                  <div class="absolute top-3 right-3 px-3 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                    Pending Review
                  </div>
                </div>

                <!-- Submission Details -->
                <div class="p-4 sm:p-5">
                  <!-- Student Info -->
                  <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                      {submission.student.firstName[0]}{submission.student.lastName[0]}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-semibold text-slate-800 truncate">
                        {submission.student.firstName} {submission.student.lastName}
                      </p>
                      <p class="text-sm text-slate-500 truncate">@{submission.student.username}</p>
                    </div>
                    <span class="text-xs text-slate-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <!-- Mission Info -->
                  <div class="mb-4">
                    <h3 class="font-semibold text-slate-800 mb-1">{submission.mission.title}</h3>
                    <p class="text-sm text-slate-600">{submission.mission.description}</p>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex gap-3">
                    <button
                      onclick={() => handleApproveSubmission(submission.id)}
                      disabled={reviewingSubmissionId === submission.id}
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {#if reviewingSubmissionId === submission.id}
                        <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      {:else}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                      {/if}
                      <span>Approve</span>
                    </button>
                    <button
                      onclick={() => handleRejectSubmission(submission.id)}
                      disabled={reviewingSubmissionId === submission.id}
                      class="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {#if reviewingSubmissionId === submission.id}
                        <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      {:else}
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      {/if}
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            {/each}
            </div>
          {:else}
            <!-- List View -->
            <div class="space-y-4">
              {#each submissionsData as submission}
                <div class="bg-white/80 backdrop-blur-sm rounded-xl shadow-md shadow-slate-200/50 border border-slate-200/60 overflow-hidden hover:shadow-lg transition-shadow">
                  <div class="flex flex-col sm:flex-row">
                    <!-- Photo Thumbnail -->
                    <div class="relative w-full sm:w-48 h-48 sm:h-auto bg-slate-100 flex-shrink-0">
                      <img
                        src={submission.photoUrl}
                        alt="{submission.mission.title} by {submission.student.firstName}"
                        class="w-full h-full object-cover"
                      />
                      <div class="absolute top-2 right-2 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                        Pending
                      </div>
                    </div>

                    <!-- Content -->
                    <div class="flex-1 p-4 sm:p-5 flex flex-col">
                      <div class="flex-1">
                        <!-- Student Info -->
                        <div class="flex items-center gap-3 mb-3">
                          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                            {submission.student.firstName[0]}{submission.student.lastName[0]}
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-semibold text-slate-800 truncate">
                              {submission.student.firstName} {submission.student.lastName}
                            </p>
                            <p class="text-sm text-slate-500 truncate">@{submission.student.username}</p>
                          </div>
                          <span class="text-xs text-slate-500 whitespace-nowrap">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                        </div>

                        <!-- Mission Info -->
                        <div class="mb-4">
                          <h3 class="font-semibold text-slate-800 mb-1">{submission.mission.title}</h3>
                          <p class="text-sm text-slate-600 line-clamp-2">{submission.mission.description}</p>
                        </div>
                      </div>

                      <!-- Action Buttons -->
                      <div class="flex gap-3">
                        <button
                          onclick={() => handleApproveSubmission(submission.id)}
                          disabled={reviewingSubmissionId === submission.id}
                          class="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {#if reviewingSubmissionId === submission.id}
                            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          {:else}
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                          {/if}
                          <span>Approve</span>
                        </button>
                        <button
                          onclick={() => handleRejectSubmission(submission.id)}
                          disabled={reviewingSubmissionId === submission.id}
                          class="flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {#if reviewingSubmissionId === submission.id}
                            <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          {:else}
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          {/if}
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        {:else}
          <!-- Empty State -->
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-12 text-center">
            <div class="text-6xl mb-4">📝</div>
            <h3 class="text-xl font-bold text-slate-800 mb-2">No Pending Submissions</h3>
            <p class="text-slate-600">All submissions have been reviewed!</p>
            <p class="text-sm text-slate-500 mt-2">New submissions will appear here when students complete missions.</p>
          </div>
        {/if}
      </div>
    {:else if currentClassData && activeTab === 'map'}
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-slate-800">Schoolyard Map Builder</h2>
            <p class="text-sm text-slate-600 mt-1">
              {isMapEditMode ? 'Drag sectors to position them, resize from corners' : 'Visual overview of your schoolyard layout'}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <button
              onclick={() => isMapEditMode = !isMapEditMode}
              class="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all"
              class:bg-blue-500={isMapEditMode}
              class:text-white={isMapEditMode}
              class:bg-slate-100={!isMapEditMode}
              class:text-slate-700={!isMapEditMode}
              class:hover:bg-slate-200={!isMapEditMode}
            >
              {#if isMapEditMode}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Done Editing
              {:else}
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Map
              {/if}
            </button>
            <button
              onclick={openCreateSectorDialog}
              class="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-md"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Sector
            </button>
          </div>
        </div>

        <!-- Map Builder -->
        <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
          {#if sectorsData.length > 0 || isMapEditMode}
            <MapBuilder
              sectors={mapSectorsData}
              mapWidth={currentClassData.mapWidth || 20}
              mapHeight={currentClassData.mapHeight || 16}
              editable={isMapEditMode}
              onSectorMove={handleSectorMove}
              onSectorResize={handleSectorResize}
              onMapResize={handleMapResize}
              onSectorClick={handleMapSectorClick}
              onAddSector={handleAddSectorFromMap}
              onPlaceSector={handlePlaceSector}
              onSectorRename={handleSectorRename}
              onSectorDelete={handleDeleteSector}
              onSectorRemoveFromMap={handleSectorRemoveFromMap}
              onSectorEdit={handleSectorEdit}
            />
          {:else}
            <!-- Empty State -->
            <div class="py-12 text-center">
              <div class="text-6xl mb-4">🗺️</div>
              <h3 class="text-xl font-bold text-slate-800 mb-2">No Sectors Yet</h3>
              <p class="text-slate-600 mb-6">Create sectors to build your schoolyard map</p>
              <button
                onclick={openCreateSectorDialog}
                class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                Create First Sector
              </button>
            </div>
          {/if}
        </div>

        <!-- Sector List (below map) - only show when not editing -->
        {#if sectorsData.length > 0 && !isMapEditMode}
          <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6">
            <h3 class="text-lg font-bold text-slate-800 mb-4">Sectors ({sectorsData.length})</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {#each missionsBySector as sector}
                <div
                  class="flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer hover:shadow-md"
                  style="border-color: {getSectorColorHex(sector.type)}40; background-color: {getSectorColorHex(sector.type)}10;"
                  onclick={() => handleMapSectorClick(sector)}
                  onkeydown={(e) => e.key === 'Enter' && handleMapSectorClick(sector)}
                  role="button"
                  tabindex="0"
                >
                  <span class="text-2xl">{sector.icon}</span>
                  <div class="flex-1 min-w-0">
                    <p class="font-semibold text-slate-800 truncate">{sector.name}</p>
                    <p class="text-xs text-slate-500">{sector.missions.length} missions</p>
                  </div>
                  <button
                    onclick={(e) => { e.stopPropagation(); handleDeleteSector(sector.id); }}
                    disabled={deletingSectorId === sector.id}
                    class="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Delete sector"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/if}
  </main>
</div>

<!-- Sector Edit Dialog -->
{#if editingSector}
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={closeSectorEditDialog}
    onkeydown={(e) => e.key === 'Escape' && closeSectorEditDialog()}
    role="presentation"
    tabindex="-1"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-sector-dialog-title"
      tabindex="0"
    >
      <div class="flex items-center gap-3 mb-4">
        <span class="text-2xl">{getSectorDisplay(editingSector.type).icon}</span>
        <h3 id="edit-sector-dialog-title" class="text-lg font-bold text-slate-800">Edit Sector</h3>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleSectorEditSubmit(); }}>
        <div class="mb-4">
          <label for="edit-sector-name" class="block text-sm font-medium text-slate-700 mb-2">
            Sector Name
          </label>
          <input
            id="edit-sector-name"
            bind:this={editSectorInputRef}
            bind:value={editingSectorName}
            type="text"
            class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Enter sector name"
            required
            minlength="2"
            maxlength="50"
          />
        </div>

        <div class="flex items-center gap-3">
          <button
            type="submit"
            class="flex-1 px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
            disabled={!editingSectorName.trim()}
          >
            Save Changes
          </button>
          <button
            type="button"
            onclick={closeSectorEditDialog}
            class="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onclick={handleSectorEditRemove}
            class="px-4 py-2 bg-amber-100 text-amber-700 font-medium rounded-lg hover:bg-amber-200 transition-colors"
            title="Remove from map"
          >
            📤 Remove
          </button>
          <button
            type="button"
            onclick={handleSectorEditDelete}
            class="px-4 py-2 bg-red-100 text-red-700 font-medium rounded-lg hover:bg-red-200 transition-colors"
            title="Delete permanently"
          >
            🗑️ Delete
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Create Class Dialog -->
{#if isCreateClassDialogOpen}
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={closeCreateClassDialog}
    onkeydown={(e) => e.key === 'Escape' && closeCreateClassDialog()}
    role="presentation"
    tabindex="-1"
  >
    <div
      bind:this={createClassDialogRef}
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => handleDialogKeydown(e, closeCreateClassDialog)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabindex="0"
    >
      <div class="px-6 py-5 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h2 id="dialog-title" class="text-xl font-bold text-slate-800">Create New Class</h2>
          <button
            onclick={closeCreateClassDialog}
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-slate-600 mt-1">Add another class to manage</p>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); handleCreateClass(e); }} class="p-6 space-y-5">
        <div>
          <label for="class-name" class="block text-sm font-semibold text-slate-700 mb-2">
            Class Name
          </label>
          <input
            type="text"
            id="class-name"
            name="className"
            bind:value={classForm.className}
            placeholder="e.g., Grade 5B"
            required
            minlength="2"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
          <p class="text-xs text-slate-500 mt-1">Minimum 2 characters</p>
        </div>

        <div>
          <label for="school-name" class="block text-sm font-semibold text-slate-700 mb-2">
            School Name
          </label>
          <input
            type="text"
            id="school-name"
            name="schoolName"
            bind:value={classForm.schoolName}
            placeholder="e.g., Amsterdam Primary"
            required
            minlength="2"
            class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
          />
          <p class="text-xs text-slate-500 mt-1">Minimum 2 characters</p>
        </div>

        <div class="flex gap-3 pt-4">
          <button
            type="button"
            onclick={closeCreateClassDialog}
            class="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors min-h-touch-target"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 min-h-touch-target"
          >
            Create Class
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}


<!-- Create Mission Dialog -->
{#if isCreateMissionDialogOpen}
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={closeCreateMissionDialog}
    onkeydown={(e) => e.key === 'Escape' && closeCreateMissionDialog()}
    role="presentation"
    tabindex="-1"
  >
    <div
      bind:this={createMissionDialogRef}
      class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => handleDialogKeydown(e, closeCreateMissionDialog)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="mission-dialog-title"
      tabindex="0"
    >
      <div class="px-6 py-5 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h2 id="mission-dialog-title" class="text-xl font-bold text-slate-800">Create New Mission</h2>
          <button
            onclick={closeCreateMissionDialog}
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-slate-600 mt-1">Add a new task for students to complete in the schoolyard</p>
      </div>

      <form onsubmit={handleCreateMission} class="p-6 space-y-5">
        <!-- Sector Selection -->
        <div>
          <label for="mission-sector" class="block text-sm font-semibold text-slate-700 mb-2">
            Sector <span class="text-red-500">*</span>
          </label>
          <select
            id="mission-sector"
            bind:value={missionForm.sectorId}
            required
            class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            class:border-red-300={missionFormErrors.sectorId}
            class:border-slate-300={!missionFormErrors.sectorId}
            class:focus:border-emerald-500={!missionFormErrors.sectorId}
          >
            <option value="">Select a sector</option>
            {#each sectorsData as sector}
              {@const display = getSectorDisplay(sector.type)}
              <option value={sector.id}>{display.icon} {sector.name}</option>
            {/each}
          </select>
          {#if missionFormErrors.sectorId}
            <p class="text-xs text-red-600 mt-1">{missionFormErrors.sectorId}</p>
          {/if}
        </div>

        <!-- Title -->
        <div>
          <label for="mission-title" class="block text-sm font-semibold text-slate-700 mb-2">
            Title <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="mission-title"
            bind:value={missionForm.title}
            placeholder="e.g., Water the Plants"
            required
            minlength="3"
            class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            class:border-red-300={missionFormErrors.title}
            class:border-slate-300={!missionFormErrors.title}
            class:focus:border-emerald-500={!missionFormErrors.title}
          />
          {#if missionFormErrors.title}
            <p class="text-xs text-red-600 mt-1">{missionFormErrors.title}</p>
          {:else}
            <p class="text-xs text-slate-500 mt-1">Minimum 3 characters</p>
          {/if}
        </div>

        <!-- Description -->
        <div>
          <label for="mission-description" class="block text-sm font-semibold text-slate-700 mb-2">
            Description <span class="text-red-500">*</span>
          </label>
          <textarea
            id="mission-description"
            bind:value={missionForm.description}
            placeholder="Describe what students need to do..."
            required
            minlength="10"
            rows="3"
            class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
            class:border-red-300={missionFormErrors.description}
            class:border-slate-300={!missionFormErrors.description}
            class:focus:border-emerald-500={!missionFormErrors.description}
          ></textarea>
          {#if missionFormErrors.description}
            <p class="text-xs text-red-600 mt-1">{missionFormErrors.description}</p>
          {:else}
            <p class="text-xs text-slate-500 mt-1">Minimum 10 characters</p>
          {/if}
        </div>

        <!-- Rewards -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="mission-xp" class="block text-sm font-semibold text-slate-700 mb-2">
              XP Reward
            </label>
            <input
              type="number"
              id="mission-xp"
              bind:value={missionForm.xpReward}
              min="1"
              max="100"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
          <div>
            <label for="mission-coins" class="block text-sm font-semibold text-slate-700 mb-2">
              Coin Reward
            </label>
            <input
              type="number"
              id="mission-coins"
              bind:value={missionForm.coinReward}
              min="1"
              max="100"
              class="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
            />
          </div>
        </div>

        <!-- Stat Boosts -->
        <div>
          <div class="block text-sm font-semibold text-slate-700 mb-3">
            Stat Boosts (0-50)
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="mission-thirst" class="block text-xs font-medium text-slate-600 mb-1">
                💧 Thirst Boost
              </label>
              <input
                type="number"
                id="mission-thirst"
                bind:value={missionForm.thirstBoost}
                min="0"
                max="50"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label for="mission-hunger" class="block text-xs font-medium text-slate-600 mb-1">
                🍎 Hunger Boost
              </label>
              <input
                type="number"
                id="mission-hunger"
                bind:value={missionForm.hungerBoost}
                min="0"
                max="50"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label for="mission-happiness" class="block text-xs font-medium text-slate-600 mb-1">
                😊 Happiness Boost
              </label>
              <input
                type="number"
                id="mission-happiness"
                bind:value={missionForm.happinessBoost}
                min="0"
                max="50"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            <div>
              <label for="mission-cleanliness" class="block text-xs font-medium text-slate-600 mb-1">
                ✨ Cleanliness Boost
              </label>
              <input
                type="number"
                id="mission-cleanliness"
                bind:value={missionForm.cleanlinessBoost}
                min="0"
                max="50"
                class="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            onclick={closeCreateMissionDialog}
            disabled={isCreatingMission}
            class="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreatingMission}
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {#if isCreatingMission}
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            {:else}
              Create Mission
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Create Sector Dialog -->
{#if isCreateSectorDialogOpen}
  <div
    class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    onclick={closeCreateSectorDialog}
    onkeydown={(e) => e.key === 'Escape' && closeCreateSectorDialog()}
    role="presentation"
    tabindex="-1"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      onclick={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="sector-dialog-title"
      tabindex="0"
    >
      <div class="px-6 py-5 border-b border-slate-200">
        <div class="flex items-center justify-between">
          <h2 id="sector-dialog-title" class="text-xl font-bold text-slate-800">Create New Sector</h2>
          <button
            onclick={closeCreateSectorDialog}
            class="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Close dialog"
          >
            <svg class="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-sm text-slate-600 mt-1">Add a new area to your schoolyard</p>
      </div>

      <form onsubmit={handleCreateSector} class="p-6 space-y-5">
        <!-- Sector Name -->
        <div>
          <label for="sector-name" class="block text-sm font-semibold text-slate-700 mb-2">
            Sector Name <span class="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="sector-name"
            bind:value={sectorForm.name}
            placeholder="e.g., Rose Garden, Oak Trees"
            required
            minlength="2"
            class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            class:border-red-300={sectorFormErrors.name}
            class:border-slate-300={!sectorFormErrors.name}
            class:focus:border-emerald-500={!sectorFormErrors.name}
          />
          {#if sectorFormErrors.name}
            <p class="text-xs text-red-600 mt-1">{sectorFormErrors.name}</p>
          {:else}
            <p class="text-xs text-slate-500 mt-1">Minimum 2 characters</p>
          {/if}
        </div>

        <!-- Sector Type -->
        <div>
          <label for="sector-type" class="block text-sm font-semibold text-slate-700 mb-2">
            Sector Type <span class="text-red-500">*</span>
          </label>
          <select
            id="sector-type"
            bind:value={sectorForm.type}
            required
            class="w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            class:border-red-300={sectorFormErrors.type}
            class:border-slate-300={!sectorFormErrors.type}
            class:focus:border-emerald-500={!sectorFormErrors.type}
          >
            <option value="TREES">Trees / Forest</option>
            <option value="FLOWERS">Flowers</option>
            <option value="POND">Pond / Water</option>
            <option value="ANIMALS">Animals</option>
            <option value="GARDEN">Vegetable Garden</option>
            <option value="PLAYGROUND">Playground</option>
            <option value="COMPOST">Compost</option>
            <option value="OTHER">Other</option>
          </select>
          {#if sectorFormErrors.type}
            <p class="text-xs text-red-600 mt-1">{sectorFormErrors.type}</p>
          {/if}
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-4">
          <button
            type="button"
            onclick={closeCreateSectorDialog}
            disabled={isCreatingSector}
            class="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isCreatingSector}
            class="flex-1 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg shadow-emerald-500/30 min-h-touch-target disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {#if isCreatingSector}
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            {:else}
              Create Sector
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Toast Notification -->
{#if toastVisible}
  <div
    class="fixed bottom-6 right-6 z-50 animate-slide-up"
    role="alert"
    aria-live="polite"
  >
    <div
      class="flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border backdrop-blur-sm min-w-[300px] max-w-md"
      class:bg-emerald-50={toastType === 'success'}
      class:border-emerald-200={toastType === 'success'}
      class:bg-red-50={toastType === 'error'}
      class:border-red-200={toastType === 'error'}
    >
      {#if toastType === 'success'}
        <div class="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p class="text-sm font-medium text-emerald-900 flex-1">{toastMessage}</p>
      {:else}
        <div class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p class="text-sm font-medium text-red-900 flex-1">{toastMessage}</p>
      {/if}
      <button
        onclick={() => (toastVisible = false)}
        class="p-1 hover:bg-black/5 rounded transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>
{/if}

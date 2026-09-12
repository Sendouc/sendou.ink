import { clsx } from "clsx";
import { Ban } from "lucide-react";
import {
	type ColorScheme,
	PicoCAD2Context,
	PicoCAD2Viewer,
	type RenderStats,
} from "picocad2-web";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { TierPill } from "~/components/TierPill";
import { useTheme } from "~/features/theme/core/provider";
import { IS_E2E_TEST_RUN } from "~/utils/e2e";
import { decompressTrophyModel } from "../trophies-utils";
import style from "./Trophy.module.css";

type TrophyCtxValue =
	| { context: PicoCAD2Context }
	| { context: undefined; isLoading: true };

const TrophyCtx = createContext<TrophyCtxValue | undefined>(undefined);

/**
 * Shares one PicoCAD2 WebGL context across every `Trophy`. Browsers cap active WebGL contexts at 16,
 * so big grids or rapid remounts with a context per trophy break rendering, and a context created
 * per mount loses its compiled shaders with every navigation. One page-wide singleton is held for
 * the page lifetime. A Trophy outside a provider uses it directly, and inside one descendants
 * render a spacer while it is loading instead of a canvas.
 */

let sharedContext: PicoCAD2Context | undefined;

function getSharedTrophyContext() {
	if (typeof window === "undefined") return undefined;
	if (!sharedContext) sharedContext = new PicoCAD2Context();
	return sharedContext;
}

export function TrophyContextProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [context, setContext] = useState<PicoCAD2Context | undefined>();

	useEffect(() => {
		setContext(getSharedTrophyContext());
	}, []);

	const value: TrophyCtxValue = context
		? { context }
		: { context: undefined, isLoading: true };

	return <TrophyCtx.Provider value={value}>{children}</TrophyCtx.Provider>;
}

export function TrophyGrid({ children }: { children: React.ReactNode }) {
	return <div className={style.grid}>{children}</div>;
}

export function Trophy({
	model,
	className,
	preview,
	tile,
	tier,
	tentativeTier,
	disableCameraControls,
	staticOnSoftwareRendering,
	pill,
	onRenderStats,
	colorScheme: forcedColorScheme,
	fps = 60,
	deferred,
}: {
	model: string;
	className?: string;
	preview?: boolean;
	tile?: boolean;
	tier?: number | null;
	tentativeTier?: number | null;
	disableCameraControls?: boolean;
	staticOnSoftwareRendering?: boolean;
	pill?: React.ReactNode;
	onRenderStats?: (stats: RenderStats) => void;
	colorScheme?: ColorScheme;
	fps?: number;
	deferred?: boolean;
}) {
	const ctxValue = useContext(TrophyCtx);
	const context = ctxValue?.context;
	const isLoadingSharedContext =
		ctxValue !== undefined && ctxValue.context === undefined;
	const viewerRef = useRef<PicoCAD2Viewer | null>(null);
	const [error, setError] = useState<boolean>(false);
	const [drawn, setDrawn] = useState(false);

	const onRenderStatsRef = useRef(onRenderStats);
	onRenderStatsRef.current = onRenderStats;

	const prevModelRef = useRef(model);
	if (prevModelRef.current !== model) {
		prevModelRef.current = model;
		setError(false);
		setDrawn(false);
	}

	const modelState = decompressTrophyModel(model);
	const siteColorScheme = useTrophyColorScheme();
	const colorScheme = forcedColorScheme ?? siteColorScheme;

	// stable ref callback identity, else React re-attaches and rebuilds the viewer every render
	const canvasRef = useCallback(
		(canvas: HTMLCanvasElement | null) => {
			if (!canvas) {
				viewerRef.current?.dispose();
				viewerRef.current = null;
				return;
			}

			if (modelState === null) return;

			const viewer = new PicoCAD2Viewer({
				canvas,
				context: context ?? getSharedTrophyContext(),
				resolution: { width: 128, height: 128, scale: 4 },
				clampCameraDistance: {
					enabled: true,
					minimumDistance: 3,
				},
				colorScheme,
			});
			viewerRef.current = viewer;

			try {
				viewer.setState(JSON.parse(modelState));
			} catch {
				setError(true);
				return;
			}

			viewer.setResolution(128, 128, 4);
			viewer.leftTag = null;
			viewer.rightTag = null;
			viewer.animation.loop = true;
			viewer.animation.speed = 1;
			viewer.clampCameraDistance = { enabled: true, minimumDistance: 3 };
			viewer.maxFps = fps;
			viewer.cameraMode = "spin";
			viewer.cameraModeSpeed = 5;
			viewer.animation.setTime(0);

			// render loops starve the main thread on software WebGL, so e2e (always CPU) and surfaces
			// showing many trophies without GPU acceleration draw a single static frame
			if (
				preview ||
				IS_E2E_TEST_RUN ||
				(staticOnSoftwareRendering && isSoftwareRendering())
			) {
				viewer.whenReady().then(() => {
					const drawOnce = () => {
						if (viewerRef.current !== viewer) return;
						if (!viewer.draw()) {
							requestAnimationFrame(drawOnce);
							return;
						}
						viewer.dispose();
						viewerRef.current = null;
						setDrawn(true);
					};
					drawOnce();
				});
				return;
			}

			if (context && onRenderStats) {
				viewer.onFrame = () => {
					onRenderStatsRef.current?.({ ...context.stats });
				};
			}

			viewer.startRenderLoop(false);
			viewer.whenReady().then(() => {
				if (viewerRef.current === viewer) setDrawn(true);
			});

			if (disableCameraControls) return;

			viewer.enableCameraControls({
				spinInertiaFactor: 0.95,
				pan: false,
				rotate: true,
				zoom: true,
				useFixedOnInteract: {
					enabled: true,
					delayBeforeRestore: 1000,
					restoreTime: 1000,
				},
			});
		},
		[
			modelState,
			context,
			preview,
			staticOnSoftwareRendering,
			disableCameraControls,
			colorScheme,
			fps,
		],
	);

	const effectiveTier = tier ?? tentativeTier ?? null;
	const containerClassName = clsx(style.container, className, {
		[style.tile]: tile,
	});
	const containerStyle = effectiveTier
		? ({
				"--tier-bg": `var(--tier-bg-${effectiveTier})`,
				"--tier-text": `var(--tier-text-${effectiveTier})`,
			} as React.CSSProperties)
		: undefined;

	const tierPill = tier ? (
		<div className={style.tierPill}>
			<TierPill tier={tier} />
		</div>
	) : tentativeTier ? (
		<div className={style.tierPill}>
			<TierPill tier={tentativeTier} isTentative />
		</div>
	) : null;

	const cornerPill = pill ? (
		<div className={style.cornerPill} data-testid="trophy-corner-pill">
			{pill}
		</div>
	) : null;

	if (error || modelState === null) {
		return (
			<div className={containerClassName} style={containerStyle}>
				<div className={clsx(style.trophy, style.error)}>
					<Ban size={48} />
				</div>
				{tierPill}
				{cornerPill}
			</div>
		);
	}

	return (
		<div
			className={containerClassName}
			style={containerStyle}
			aria-busy={!drawn}
		>
			{deferred || isLoadingSharedContext ? (
				<div className={style.trophy} />
			) : (
				<canvas
					ref={canvasRef}
					className={clsx(style.trophy, {
						[style.visible]: drawn,
						[style.interactive]: !preview && !disableCameraControls,
					})}
				/>
			)}
			{drawn ? null : (
				<div className={style.loading}>
					<div className={style.spinner} />
				</div>
			)}
			{tierPill}
			{cornerPill}
		</div>
	);
}

function useTrophyColorScheme(): ColorScheme {
	const { userTheme, htmlThemeClass } = useTheme();
	if (userTheme === "auto") return "auto";

	return htmlThemeClass || "auto";
}

let softwareRenderingDetected: boolean | undefined;

function isSoftwareRendering() {
	if (softwareRenderingDetected !== undefined) return softwareRenderingDetected;
	if (typeof document === "undefined") return false;

	const gl = document
		.createElement("canvas")
		.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
	softwareRenderingDetected = !gl;
	gl?.getExtension("WEBGL_lose_context")?.loseContext();

	return softwareRenderingDetected;
}

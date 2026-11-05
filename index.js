class FunctionRegistry {
  constructor(className) {
    this.className = className;
    this.functions = Object.create(null);
    this.instances = [];
  }

  register(functionName, nested = []) {
    this.functions[functionName] = Array.from(nested);
    return this.functions[functionName];
  }

  retain(instance) {
    this.instances.push(instance);
    return instance;
  }
}

class DeviceProfile {
  constructor() {
    this.registry = new FunctionRegistry("DeviceProfile");
    this.registry.register("detect", ["browser", "operatingSystem", "deviceMode", "viewport"]);
    this.registry.register("features", ["webgpu", "webAudio", "webBluetooth", "webUSB", "webAssembly"]);
  }

  detect() {
    const ua = navigator.userAgent || "";
    const width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const browser = /Edg\//.test(ua) ? "Edge" :
      /Firefox\//.test(ua) ? "Firefox" :
      /Chrome\//.test(ua) && !/Edg\//.test(ua) ? "Chrome" :
      /Safari\//.test(ua) && !/Chrome\//.test(ua) ? "Safari" : "Other";
    const operatingSystem = /Android/i.test(ua) ? "Android" :
      /iPhone|iPad|iPod/i.test(ua) ? "iOS" :
      /Windows/i.test(ua) ? "Windows" :
      /Mac OS|Macintosh/i.test(ua) ? "macOS" :
      /Linux/i.test(ua) ? "Linux" : "Other";
    const touch = navigator.maxTouchPoints > 1;
    const deviceMode = width < 720 ? "mobile" :
      (width < 1100 || (touch && /iPad|Tablet/i.test(ua))) ? "tablet" : "desktop";
    const features = {
      webgpu: Boolean(navigator.gpu),
      webAudio: Boolean(window.AudioContext || window.webkitAudioContext),
      webBluetooth: Boolean(navigator.bluetooth),
      webUSB: Boolean(navigator.usb),
      webAssembly: typeof WebAssembly === "object"
    };
    return { browser, operatingSystem, deviceMode, viewport: { width, height }, features };
  }
}

class InterfaceRenderer {
  constructor(root) {
    this.root = root;
    this.registry = new FunctionRegistry("InterfaceRenderer");
    this.registry.register("createStyles", ["tokens", "responsiveRules", "motionRules"]);
    this.registry.register("render", ["desktopWindow", "androidShell", "hero", "status"]);
    this.logoPath = "./Woodpecker%20AI%20Mascot%20Logo.png";
  }

  createStyles() {
    const style = document.createElement("style");
    style.dataset.owner = "woodpecker-runtime";
    style.textContent = `
      :root{color-scheme:dark;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#101820;color:#f5f7f8;font-synthesis:none;text-rendering:optimizeLegibility}
      *{box-sizing:border-box}
      html,body{margin:0;min-height:100%;width:100%;background:#101820}
      body{min-height:100svh;overflow-x:hidden}
      .wp-root{min-height:100svh;display:grid;place-items:center;padding:clamp(12px,3vw,40px);background:radial-gradient(ellipse at 50% 38%,#1e3440 0%,#101820 58%,#0a1117 100%)}
      .wp-window{width:min(100%,980px);min-height:min(720px,88svh);border:1px solid #36505b;border-radius:18px;overflow:hidden;background:#111d25;box-shadow:0 28px 90px #0008;display:flex;flex-direction:column}
      .wp-titlebar{height:48px;flex:0 0 48px;display:flex;align-items:center;gap:10px;padding:0 17px;background:#1b2a33;border-bottom:1px solid #314650;color:#dce6e9;font-size:13px;letter-spacing:.04em}
      .wp-lights{display:flex;gap:6px}.wp-light{width:9px;height:9px;border-radius:50%;background:#71848b}
      .wp-window-name{margin-left:8px}
      .wp-content{flex:1;display:grid;place-items:center;padding:clamp(28px,6vw,72px) 22px;text-align:center}
      .wp-hero{width:min(100%,620px);display:flex;align-items:center;flex-direction:column;gap:18px}
      .wp-logo{display:block;width:min(68vw,390px);max-height:42svh;object-fit:contain;filter:drop-shadow(0 18px 34px #0007)}
      .wp-brand{margin:0;font-size:clamp(2.2rem,7vw,4.5rem);line-height:1.02;font-weight:760;letter-spacing:-.055em;color:#f5f7f8}
      .wp-byline{margin:0;color:#a9bbc2;font-size:clamp(.95rem,2.3vw,1.18rem);letter-spacing:.025em}
      .wp-divider{width:54px;height:2px;border:0;background:#67c4b2;border-radius:2px;margin:8px auto 0}
      .wp-runtime{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#71858d;margin-top:18px}
      .wp-bottom{padding:12px 18px;border-top:1px solid #263a44;color:#72858d;font-size:11px;display:flex;justify-content:space-between;gap:12px}
      .wp-android-top,.wp-android-nav{display:none}
      .mode-tablet .wp-root,.mode-mobile .wp-root{padding:0;background:#101820}
      .mode-tablet .wp-window,.mode-mobile .wp-window{width:100%;min-height:100svh;border:0;border-radius:0;box-shadow:none;background:#111d25}
      .mode-tablet .wp-titlebar,.mode-mobile .wp-titlebar{display:none}
      .mode-tablet .wp-android-top,.mode-mobile .wp-android-top{height:34px;display:flex;align-items:center;justify-content:space-between;padding:0 18px;background:#0c151b;color:#b9c8ce;font-size:11px}
      .mode-tablet .wp-content,.mode-mobile .wp-content{padding:28px 18px 42px}
      .mode-tablet .wp-logo,.mode-mobile .wp-logo{width:min(76vw,340px);max-height:38svh}
      .mode-tablet .wp-android-nav,.mode-mobile .wp-android-nav{display:flex;justify-content:center;align-items:center;height:28px;background:#0c151b}
      .wp-gesture{width:108px;height:4px;border-radius:8px;background:#8b9ba1}
      @media(prefers-reduced-motion:no-preference){.wp-logo{animation:wp-arrive .8s cubic-bezier(.2,.8,.2,1) both}@keyframes wp-arrive{from{opacity:0;transform:translateY(12px) scale(.985)}to{opacity:1;transform:translateY(0) scale(1)}}}
      @media(max-height:520px){.wp-logo{width:auto;height:34svh}.wp-content{padding:12px}}
    `;
    document.head.append(style);
  }

  element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  render(profile) {
    this.createStyles();
    document.body.classList.toggle("mode-mobile", profile.deviceMode === "mobile");
    document.body.classList.toggle("mode-tablet", profile.deviceMode === "tablet");
    const root = this.element("main", "wp-root");
    const windowFrame = this.element("section", "wp-window");
    windowFrame.setAttribute("aria-label", "Woodpecker AI");
    const androidTop = this.element("div", "wp-android-top");
    androidTop.append(this.element("span", "", "WOODPECKER AI"), this.element("span", "", "●  ●  ●"));
    const titlebar = this.element("header", "wp-titlebar");
    const lights = this.element("span", "wp-lights");
    ["one","two","three"].forEach(() => lights.append(this.element("i", "wp-light")));
    titlebar.append(lights, this.element("span", "wp-window-name", "Woodpecker AI"));
    const content = this.element("div", "wp-content");
    const hero = this.element("section", "wp-hero");
    const logo = this.element("img", "wp-logo");
    logo.src = this.logoPath;
    logo.alt = "Woodpecker AI mascot";
    logo.decoding = "async";
    logo.fetchPriority = "high";
    const heading = this.element("h1", "wp-brand", "Woodpecker AI");
    const byline = this.element("p", "wp-byline", "by Woodpecker Agency");
    const divider = this.element("hr", "wp-divider");
    const runtime = this.element("p", "wp-runtime", "Initialising JavaScript / R hybrid runtime");
    runtime.id = "wp-runtime-status";
    hero.append(logo, heading, byline, divider, runtime);
    content.append(hero);
    const footer = this.element("footer", "wp-bottom");
    footer.append(this.element("span", "", "WOODPECKER AGENCY"), this.element("span", "", "JavaScript + WebR"));
    const androidNav = this.element("div", "wp-android-nav");
    androidNav.append(this.element("span", "wp-gesture"));
    windowFrame.append(androidTop, titlebar, content, footer, androidNav);
    root.append(windowFrame);
    this.root.replaceChildren(root);
    document.title = "Woodpecker AI — by Woodpecker Agency";
    return runtime;
  }
}

class WebRAuditor {
  constructor() {
    this.registry = new FunctionRegistry("WebRAuditor");
    this.registry.register("initialise", ["loadRSource", "startWebR", "sourceAudit"]);
    this.registry.register("audit", ["recordEvent", "summarise"]);
    this.instance = null;
    this.ready = false;
  }

  async initialise() {
    const response = await fetch("./index.R", { cache: "no-cache" });
    if (!response.ok) throw new Error("Unable to load index.R (" + response.status + ")");
    const rSource = await response.text();
    const module = await import("https://webr.r-wasm.org/latest/webr.mjs");
    const WebR = module.WebR;
    this.instance = new WebR();
    await this.instance.init();
    await this.instance.evalRVoid(rSource);
    this.ready = true;
    await this.recordEvent("javascript_runtime_ready");
    return true;
  }

  async recordEvent(name) {
    if (!this.ready || !this.instance) return false;
    const safeName = String(name).replace(/[^a-zA-Z0-9_ -]/g, "_");
    await this.instance.evalRVoid("audit_event(" + JSON.stringify(safeName) + ")");
    return true;
  }

  async summarise() {
    if (!this.ready || !this.instance) return null;
    const result = await this.instance.evalR("audit_summary()");
    return result.toJs();
  }
}

class RuntimeAction {
  constructor(name, auditor) {
    this.name = name;
    this.auditor = auditor;
    this.registry = new FunctionRegistry("RuntimeAction");
    this.registry.register("execute", ["audit", "retain"]);
    this.executions = 0;
  }

  async execute() {
    this.executions += 1;
    await this.auditor.recordEvent(this.name);
    return this.executions;
  }
}

class WoodpeckerRuntime {
  constructor() {
    this.registry = new FunctionRegistry("WoodpeckerRuntime");
    this.registry.register("start", ["fetchR", "detectProfile", "renderInterface", "startAudit"]);
    this.registry.register("continuous", ["resize", "retainActions", "auditEvents"]);
    this.profile = null;
    this.renderer = new InterfaceRenderer(document.body);
    this.auditor = new WebRAuditor();
    this.actions = [];
    this.statusNode = null;
    this.deviceProfile = new DeviceProfile();
    this.registry.retain(this.renderer);
    this.registry.retain(this.auditor);
    this.registry.retain(this.deviceProfile);
  }

  async start() {
    this.statusNode = this.renderer.render({
      deviceMode: "desktop"
    });
    try {
      const rResponse = await fetch("./index.R", { cache: "no-cache" });
      if (!rResponse.ok) throw new Error("index.R returned " + rResponse.status);
      this.rSource = await rResponse.text();
      this.profile = this.deviceProfile.detect();
      this.statusNode = this.renderer.render(this.profile);
      this.statusNode.textContent = this.describeProfile();
      this.installContinuousActions();
      await this.auditor.initialise();
      this.statusNode.textContent = "JavaScript + WebR runtime online";
      await this.audit("application_started");
    } catch (error) {
      console.error("Woodpecker AI runtime:", error);
      if (this.statusNode) this.statusNode.textContent = "JavaScript online · R audit layer unavailable";
    }
  }

  describeProfile() {
    const p = this.profile;
    return p.browser + " · " + p.operatingSystem + " · " + p.deviceMode +
      " · WebGPU " + (p.features.webgpu ? "available" : "not detected");
  }

  installContinuousActions() {
    const resizeAction = new RuntimeAction("viewport_resized", this.auditor);
    this.actions.push(resizeAction);
    window.addEventListener("resize", () => {
      this.profile = this.deviceProfile.detect();
      document.body.classList.toggle("mode-mobile", this.profile.deviceMode === "mobile");
      document.body.classList.toggle("mode-tablet", this.profile.deviceMode === "tablet");
      resizeAction.execute();
    }, { passive: true });
    const visibilityAction = new RuntimeAction("visibility_changed", this.auditor);
    this.actions.push(visibilityAction);
    document.addEventListener("visibilitychange", () => visibilityAction.execute());
  }

  async audit(eventName) {
    const action = new RuntimeAction(eventName, this.auditor);
    this.registry.retain(action);
    this.actions.push(action);
    return action.execute();
  }
}

const woodpecker = new WoodpeckerRuntime();
woodpecker.start();

import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    Peer: any;
  }
}

type Role = "patient" | "admin";

export default function VideoCallPage() {
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<Role | null>(null);
  const [status, setStatus] = useState<string>("Not connected");
  const [roomId, setRoomId] = useState<string>("");
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [connected, setConnected] = useState(false);
  const [sessionTime, setSessionTime] = useState("00:00");
  const [logs, setLogs] = useState<Array<{ msg: string; type: string }>>([]);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const activeCallRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionSecondsRef = useRef(0);

  const PEER_CONFIG = {
    host: "0.peerjs.com",
    port: 443,
    path: "/",
    secure: true,
    config: {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun.cloudflare.com:3478" },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject",
        },
      ],
    },
  };

  const addLog = (msg: string, type: string = "") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [...prev.slice(-20), { msg: `${time}  ${msg}`, type }]);
  };

  const generateRoomId = () => {
    return "MW-" + Math.random().toString(36).substr(2, 8).toUpperCase();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sessionSecondsRef.current = 0;
    timerRef.current = setInterval(() => {
      sessionSecondsRef.current++;
      const mins = Math.floor(sessionSecondsRef.current / 60)
        .toString()
        .padStart(2, "0");
      const secs = (sessionSecondsRef.current % 60).toString().padStart(2, "0");
      setSessionTime(`${mins}:${secs}`);
    }, 1000);
  };

  const loadPeerJS = () => {
    if (window.Peer) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  };

  const initPatient = async () => {
    const newRoomId = generateRoomId();
    setRoomId(newRoomId);
    setStatus("Initialising...");
    addLog(`Room ID: ${newRoomId}`, "ok");
    addLog("Connecting to signaling server...", "info");

    try {
      await loadPeerJS();
      const peer = new window.Peer(newRoomId, PEER_CONFIG);
      peerRef.current = peer;

      peer.on("open", (id: string) => {
        addLog(`Ready — Room: ${id}`, "ok");
        setStatus(`Ready · ${id}`);
      });

      peer.on("call", (call: any) => {
        addLog("Doctor is calling — answering...", "info");
        setStatus("Doctor connecting...");

        const answerWithStream = (stream: MediaStream) => {
          call.answer(stream);
          activeCallRef.current = call;

          call.on("stream", (remoteStream: MediaStream) => {
            addLog("Two-way connection established!", "ok");
            setStatus("Doctor connected 🟢");
            setConnected(true);
            if (remoteVideoRef.current) {
              remoteVideoRef.current.srcObject = remoteStream;
            }
          });

          call.on("close", () => {
            setStatus("Doctor disconnected");
            setConnected(false);
            addLog("Doctor disconnected", "info");
          });

          call.on("error", (err: any) => {
            addLog(`Call error: ${err}`, "err");
          });
        };

        if (localStreamRef.current) {
          answerWithStream(localStreamRef.current);
        } else {
          navigator.mediaDevices
            .getUserMedia({ video: true, audio: true })
            .then((stream) => {
              localStreamRef.current = stream;
              setCamOn(true);
              if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
              }
              answerWithStream(stream);
            })
            .catch((e) => {
              addLog(`Could not get camera: ${e.message}`, "err");
              answerWithStream(new MediaStream());
            });
        }
      });

      peer.on("error", (err: any) => {
        addLog(`Peer error: ${err.type} — ${err.message}`, "err");
        if (err.type === "unavailable-id") {
          const newId = generateRoomId();
          peer.destroy();
          initPatient();
        } else {
          setStatus("Connection error");
        }
      });

      peer.on("disconnected", () => {
        addLog("Disconnected from server — reconnecting...", "info");
        try {
          peer.reconnect();
        } catch (e) {}
      });
    } catch (e) {
      addLog("Failed to load PeerJS", "err");
    }
  };

  const initAdmin = async () => {
    setStatus("Initialising...");
    addLog("Connecting to signaling server...", "info");
    startTimer();

    try {
      await loadPeerJS();
      const adminId = "ADMIN-" + generateRoomId();
      const peer = new window.Peer(adminId, PEER_CONFIG);
      peerRef.current = peer;

      peer.on("open", () => {
        addLog("Ready — enter a patient Room ID to connect", "ok");
        setStatus("Ready");

        const params = new URLSearchParams(window.location.search);
        const joinId = params.get("join");
        if (joinId) {
          setRoomId(joinId);
          addLog(`Room ID from link: ${joinId}`, "info");
        }
      });

      peer.on("error", (err: any) => {
        addLog(`Peer error: ${err.type}`, "err");
        setStatus("Error");
      });
    } catch (e) {
      addLog("Failed to load PeerJS", "err");
    }
  };

  const toggleCamera = async () => {
    if (!camOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });
        localStreamRef.current = stream;
        setCamOn(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        addLog("Camera started (HD 720p)", "ok");
        startTimer();
      } catch (e: any) {
        addLog(`Camera denied: ${e.message}`, "err");
      }
    } else {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
      setCamOn(false);
      if (timerRef.current) clearInterval(timerRef.current);
      addLog("Camera stopped", "info");
    }
  };

  const toggleMic = () => {
    setMicOn(!micOn);
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((t) => {
        t.enabled = !micOn;
      });
    }
  };

  const adminJoin = async () => {
    const targetRoomId = roomId.trim().toUpperCase();
    if (!targetRoomId) {
      addLog("Enter a patient Room ID first", "err");
      return;
    }
    if (!peerRef.current) {
      addLog("Still connecting — try again in a moment", "err");
      return;
    }

    setStatus("Connecting...");
    addLog(`Connecting to room: ${targetRoomId}`, "info");

    let myStream: MediaStream | null = null;
    try {
      myStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch (e) {
      myStream = new MediaStream();
    }

    let call;
    try {
      call = peerRef.current.call(targetRoomId, myStream);
    } catch (e: any) {
      addLog(`Could not call room ${targetRoomId}: ${e.message}`, "err");
      setStatus("Failed");
      return;
    }

    if (!call) {
      addLog("No call object — peer may be offline", "err");
      setStatus("Not found");
      return;
    }

    activeCallRef.current = call;

    const timeout = setTimeout(() => {
      if (!remoteVideoRef.current?.srcObject) {
        addLog(`Timeout — no stream from ${targetRoomId}`, "err");
        setStatus("Timeout");
      }
    }, 15000);

    call.on("stream", (remoteStream: MediaStream) => {
      clearTimeout(timeout);
      addLog(`Live feed received from ${targetRoomId} ✓`, "ok");
      setStatus(`Live · ${targetRoomId}`);
      setConnected(true);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });

    call.on("close", () => {
      clearTimeout(timeout);
      addLog(`Patient ${targetRoomId} disconnected`, "info");
      setStatus("Disconnected");
      setConnected(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    call.on("error", (err: any) => {
      clearTimeout(timeout);
      addLog(`Call error: ${err}`, "err");
      setStatus("Error");
    });
  };

  const disconnect = () => {
    if (activeCallRef.current) {
      activeCallRef.current.close();
      activeCallRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    setConnected(false);
    setCamOn(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setStatus("Disconnected");
    addLog("Disconnected", "info");
  };

  const goBack = () => {
    disconnect();
    setLocation("/");
  };

  const copyToClipboard = (text: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  if (!role) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-block w-4 h-4 rounded-full bg-green-500 animate-pulse mb-2"></div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">MedWatch Live</h1>
            <p className="text-gray-600 text-sm">
              Real-time remote patient monitoring · WebRTC encrypted · works across any device
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setRole("patient");
                initPatient();
              }}
              className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:bg-green-100 hover:border-green-300 transition-all cursor-pointer text-center"
            >
              <div className="text-4xl mb-3">🏥</div>
              <h3 className="font-semibold text-gray-900 mb-2">Patient</h3>
              <p className="text-xs text-gray-600">
                Share your live camera with your doctor anywhere in the world
              </p>
            </button>
            <button
              onClick={() => {
                setRole("admin");
                initAdmin();
              }}
              className="bg-green-50 border-2 border-green-200 rounded-xl p-6 hover:bg-green-100 hover:border-green-300 transition-all cursor-pointer text-center"
            >
              <div className="text-4xl mb-3">👨‍⚕️</div>
              <h3 className="font-semibold text-gray-900 mb-2">Doctor / Admin</h3>
              <p className="text-xs text-gray-600">
                Watch live patient feeds from any device, any location
              </p>
            </button>
          </div>
          <div className="mt-6 text-center text-xs text-gray-500 space-y-1">
            <p>🔒 Video streams directly device-to-device via WebRTC</p>
            <p>No video is ever stored on a server</p>
            <p>Works across phones, tablets & computers worldwide</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Bar */}
      <div className="bg-green-50 border-b-2 border-green-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
          <span className="font-semibold text-gray-900">
            MedWatch · {role === "patient" ? "Patient" : "Admin / Doctor"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              connected
                ? "bg-green-100 text-green-700 border border-green-300"
                : "bg-gray-100 text-gray-600 border border-gray-300"
            }`}
          >
            {status}
          </span>
          <button
            onClick={goBack}
            className="px-3 py-1 rounded-lg text-sm border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
        {!camOn && !connected && (
          <div className="text-center text-gray-400">
            <div className="text-5xl mb-3">{role === "patient" ? "📷" : "🖥️"}</div>
            <p className="text-gray-300">
              {role === "patient"
                ? "Tap the camera button to start"
                : "Enter a Room ID below to watch a patient live"}
            </p>
          </div>
        )}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${!camOn ? "hidden" : ""}`}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full object-cover ${!connected ? "hidden" : ""}`}
        />
        {connected && (
          <div className="absolute top-3 left-3 flex gap-2">
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              LIVE
            </div>
            <div className="bg-black/70 text-white px-3 py-1 rounded-full text-xs">
              {sessionTime}
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-green-50 border-t-2 border-green-200 px-4 py-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={toggleMic}
            className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-xl transition-all ${
              micOn
                ? "bg-white border-green-300 text-gray-600"
                : "bg-red-100 border-red-300 text-red-600"
            }`}
          >
            {micOn ? "🎤" : "🔇"}
          </button>
          <button
            onClick={toggleCamera}
            className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl transition-all ${
              camOn
                ? "bg-green-100 border-green-400 text-green-700"
                : "bg-white border-green-300 text-gray-600"
            }`}
          >
            📸
          </button>
          <button
            onClick={disconnect}
            className="w-12 h-12 rounded-full border-2 bg-red-100 border-red-300 text-red-600 flex items-center justify-center text-xl transition-all hover:bg-red-200"
          >
            📵
          </button>
        </div>

        {role === "admin" && (
          <div className="flex gap-2">
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Paste patient's Room ID here…"
              className="flex-1 bg-white border-2 border-green-200 rounded-lg px-4 py-2 text-sm font-mono focus:outline-none focus:border-green-400"
            />
            <button
              onClick={adminJoin}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Connect
            </button>
          </div>
        )}

        {role === "patient" && roomId && (
          <div className="space-y-2">
            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
              <div className="text-xs text-green-700 mb-1 flex items-center gap-2">
                🔗 Share this link with your doctor to connect
              </div>
              <div
                className="text-xs font-mono text-gray-700 bg-white border border-green-200 rounded px-3 py-2 cursor-pointer truncate"
                onClick={() => copyToClipboard(`${window.location.origin}${window.location.pathname}?join=${roomId}`)}
              >
                {window.location.origin}${window.location.pathname}?join={roomId}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={roomId}
                readOnly
                className="flex-1 bg-white border-2 border-green-200 rounded-lg px-4 py-2 text-sm font-mono"
              />
              <button
                onClick={() => copyToClipboard(roomId)}
                className="px-4 py-2 rounded-lg border-2 border-green-200 text-gray-600 hover:bg-green-50 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Log Box */}
      <div className="bg-gray-50 border-t border-gray-200 max-h-24 overflow-y-auto p-2">
        {logs.map((log, i) => (
          <div
            key={i}
            className={`text-xs font-mono ${
              log.type === "ok" ? "text-green-600" : log.type === "err" ? "text-red-600" : log.type === "info" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            {log.msg}
          </div>
        ))}
      </div>
    </div>
  );
}

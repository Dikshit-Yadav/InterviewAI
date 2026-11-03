import React from "react";
import {
  AlertCircle,
  Code2,
  Play,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Maximize2,
  Minimize2,
  Square,
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  Zap,
  RotateCcw,
  Info,
  FileText,
  Lightbulb,
  Check,
  Lock,
  Sparkles,
  Trophy,
  LayoutDashboard,
  ShieldAlert,
  XCircle,
} from "lucide-react";

type IconProps = {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
};

export const ExclamationCircleOutlined = ({ className = "", style, onClick }: IconProps) => (
  <AlertCircle className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const CodeOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Code2 className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const PlayCircleOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Play className={`inline-block shrink-0 fill-current ${className}`} style={style} onClick={onClick} size={16} />
);

export const ShieldCheckOutlined = ({ className = "", style, onClick }: IconProps) => (
  <ShieldCheck className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const CloseCircleOutlined = ({ className = "", style, onClick }: IconProps) => (
  <XCircle className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const CheckCircleOutlined = ({ className = "", style, onClick }: IconProps) => (
  <CheckCircle2 className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const ClockCircleOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Clock className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const WarningOutlined = ({ className = "", style, onClick }: IconProps) => (
  <AlertTriangle className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const FullscreenOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Maximize2 className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const FullscreenExitOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Minimize2 className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const StopOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Square className={`inline-block shrink-0 fill-current ${className}`} style={style} onClick={onClick} size={14} />
);

export const SendOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Send className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={15} />
);

export const AudioOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Mic className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const AudioMutedOutlined = ({ className = "", style, onClick }: IconProps) => (
  <MicOff className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const RobotOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Bot className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={18} />
);

export const UserOutlined = ({ className = "", style, onClick }: IconProps) => (
  <User className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={18} />
);

export const ThunderboltOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Zap className={`inline-block shrink-0 fill-current ${className}`} style={style} onClick={onClick} size={13} />
);

export const ReloadOutlined = ({ className = "", style, onClick }: IconProps) => (
  <RotateCcw className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={14} />
);

export const InfoCircleOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Info className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={14} />
);

export const FileTextOutlined = ({ className = "", style, onClick }: IconProps) => (
  <FileText className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const BulbOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Lightbulb className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={15} />
);

export const CheckOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Check className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={15} />
);

export const LockOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Lock className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={14} />
);

export const SparklesOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Sparkles className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const TrophyOutlined = ({ className = "", style, onClick }: IconProps) => (
  <Trophy className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const DashboardOutlined = ({ className = "", style, onClick }: IconProps) => (
  <LayoutDashboard className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={16} />
);

export const ShieldAlertOutlined = ({ className = "", style, onClick }: IconProps) => (
  <ShieldAlert className={`inline-block shrink-0 ${className}`} style={style} onClick={onClick} size={20} />
);

export default {
  ExclamationCircleOutlined,
  CodeOutlined,
  PlayCircleOutlined,
  ShieldCheckOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  StopOutlined,
  SendOutlined,
  AudioOutlined,
  AudioMutedOutlined,
  RobotOutlined,
  UserOutlined,
  ThunderboltOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  FileTextOutlined,
  BulbOutlined,
  CheckOutlined,
  LockOutlined,
  SparklesOutlined,
  TrophyOutlined,
  DashboardOutlined,
  ShieldAlertOutlined,
};


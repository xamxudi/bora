import React, { useState, useEffect } from 'react';
import generateMedia from '../../services/MediaGeneration';
import { useSignalRContext } from '../../contexts/SignalRContext';
import { generateVideoPayload } from "../../utils/GenerateVideoPayload";
import { generatePayload } from "../../utils/GeneratePayload";
import PromptInput from "../../components/MediaGeneration/PromptInput";
import { FaStar, FaTh, FaTable, FaDownload, FaTrash, FaImage, FaVideo } from "react-icons/fa";
import { Row, Col } from 'react-bootstrap';
import TaskList from '../../components/Tasks/TaskContainer';
import TaskDetailModal from '../../components/Tasks/TaskDetailModal';
import { TaskService } from "../../services/ApiService";
import { useMessage } from '../../contexts/MessageContext';
import BoraCredit from '../../components/ui/BoraCredit';
import './GenerationPanel.css';

export default function GenerationPanel({
  // ---- Common props ----
  promtyStyle,
  actionType,
  onTransferToActionType,
  baseModel,
  loras = [],
  imageFiles = [],

  // ---- For Image ----
  steps, cfg, seed, width, height, samplingMethod, clipEncoder, controlNets = [], vae,

  // ---- For Video ----
  resolution, duration, fps, quality,
}) {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentDisplayType, setCurrentDisplayType] = useState('card');
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [showNegative, setShowNegative] = useState(false);  

  const message = useMessage();
  const { addNotificationListener, removeNotificationListener } = useSignalRContext();

  // Load tasks ban đầu
  useEffect(() => {
    const fetchData = async () => {
      const taskLoaded = await TaskService.getTasks(20);
      if (taskLoaded) setTasks(taskLoaded);
    };
    fetchData();
  }, []);

  // Lắng nghe sự kiện SignalR
  useEffect(() => {
    const handleTaskCompletedNotification = (data) => {
      if (data?.taskId) {
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.taskId === data.taskId
              ? { ...t, status: data.status, message: data.status === 'Completed' ? 'Hoàn thành' : (data.message || ""), outputUrl: data.result }
              : t
          )
        );
      }
    };

    const handleTaskProcessingNotification = (data) => {
      if (data?.taskId) {
        setTasks((prevTasks) =>
          prevTasks.map((t) =>
            t.taskId === data.taskId
              ? { ...t, status: 'Processing', message: 'Đang xử lý...' }
              : t
          )
        );
      }
    };

    addNotificationListener('TaskProcessing', handleTaskProcessingNotification);
    addNotificationListener('TaskCompleted', handleTaskCompletedNotification);

    return () => {
      removeNotificationListener('TaskProcessing', handleTaskProcessingNotification);
      removeNotificationListener('TaskCompleted', handleTaskCompletedNotification);
    };
  }, [addNotificationListener, removeNotificationListener]);

  // Gửi yêu cầu
  const handleGenerate = async () => {
    let payload;
    try {
      if (actionType > 2) {
        // Video
        payload = generateVideoPayload({
          prompt: `${prompt} ${promtyStyle}`,
          negativePrompt,
          steps,
          cfg,
          seed,
          resolution,
          duration,
          fps,
          quality,
          baseModel,
          loras,
          imageFiles,
          actionType
        });
      } else {
        // Image
        const loraPayload = loras.map((l) => ({ id: l.id, fileName: l.fileName, strength: l.strength ?? 1.0 }));
        const controlNetsPayload = controlNets.map((c) => ({ id: c.id, fileName: c.fileName, strength: c.strength ?? 1.0 }));

        payload = generatePayload({
          prompt: `${prompt} ${promtyStyle}`,
          negativePrompt,
          steps,
          cfg,
          seed,
          width,
          height,
          sampler: samplingMethod,
          clipEncoder,
          baseModel,
          loras: loraPayload,
          controlNets: controlNetsPayload,
          vae,
          imageFiles,
          actionType
        });
      }
    } catch (error) {
      message.error(`Đã có lỗi hệ thống! xin thử lại sau ít phút.`);
    }

    if (payload) {
      const promise = generateMedia(payload);
      const result = await message.promise(promise, {
        pending: 'Đang tạo yêu cầu...',
        success: { render({ data }) { return `Thành công! Task ID: ${data?.taskId}`; } },
        error: { render({ data }) { return `${data?.message || 'Đã xảy ra lỗi không xác định.'}`; } },
      });

      if (result?.taskId) {
        setTasks((prev) => [...prev, result]);
        if(window.innerWidth < 768)
          setSelectedTask(result);
      } else {
        message.error('Lỗi từ hệ thống, vui lòng thử lại sau ít phút.');
      }
    }
  };

  // Xử lý khác (delete, download, chuyển đổi...)
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Bạn có chắc muốn xóa task này?")) return;
    try {
      const promise = TaskService.delete(taskId);
      await message.promise(promise, {
        pending: 'Đang xóa task...',
        success: 'Đã xóa task thành công!',
        error: { render({ data }) { return `${data?.message || 'Không xác định.'}`; } },
      });
      setTasks((prev) => prev.filter((t) => t.taskId !== taskId));
    } catch { }
  };

  const handleDownloadOutput = async (url, task) => {
    if (!url) {
      alert('Không có output để tải xuống');
      return;
    }
    let filename = `task-${task.taskId}`;
    if (task.prompt) {
      const cleanPrompt = task.prompt.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').substring(0, 20);
      const mediaType = getMediaType(url);
      filename = `${cleanPrompt || 'output'}_${task.taskId.slice(0, 6)}.${mediaType === 'image' ? 'png' : mediaType === 'video' ? 'mp4' : 'file'}`;
    }
    try {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      message.error('Tải xuống thất bại: ' + error.message);
    }
  };

  const handleTransferToImg2Video = (outputUrl) => {
    onTransferToActionType(outputUrl, 4);
    setSelectedTask(null);
  };
  const handleTransferToImg2Img = (outputUrl) => {
    onTransferToActionType(outputUrl, 2);
    setSelectedTask(null);
  };

  const getMediaType = (url) => {
    if (!url) return null;
    const lower = url.toLowerCase();
    if (/\.(png|jpg|jpeg|gif|webp|bmp|tiff)$/.test(lower)) return 'image';
    if (/\.(mp4|webm|ogg|mov|avi)$/.test(lower)) return 'video';
    return null;
  };

  const createActionButton = ({ Icon, label, color = '#fff', onClickHandler, shouldDisplay = () => true }) =>
    (task) => shouldDisplay(task) && (
      <button
        onClick={(e) => { e.stopPropagation(); onClickHandler(task); }}
        style={{ background: 'none', border: 'none', color, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', width: '100%' }}
        title={label}
      >
        {Icon && <Icon />} {label}
      </button>
    );

  const actionTaskButtons = [
    createActionButton({ Icon: FaDownload, label: 'Tải xuống', color: '#6c757d', onClickHandler: (task) => handleDownloadOutput(task.outputUrl, task), shouldDisplay: (t) => !!t.outputUrl }),
    createActionButton({ Icon: FaVideo, label: 'Chuyển sang video', color: '#28a745', onClickHandler: (task) => handleTransferToImg2Video(task.outputUrl), shouldDisplay: (t) => t.outputUrl && getMediaType(t.outputUrl) === 'image' }),
    createActionButton({ Icon: FaImage, label: 'Chuyển sang image', color: '#007bff', onClickHandler: (task) => handleTransferToImg2Img(task.outputUrl), shouldDisplay: (t) => t.outputUrl && getMediaType(t.outputUrl) === 'image' }),
    createActionButton({ Icon: FaTrash, label: 'Xóa task', color: '#dc3545', onClickHandler: (task) => handleDeleteTask(task.taskId) }),
  ];

  return (
    <div className="container-fluid">
      <div className="generation-panel">
        <PromptInput prompt={prompt} setPrompt={setPrompt} negativePrompt={negativePrompt} setNegativePrompt={setNegativePrompt} showNegative={showNegative} />
        <Row style={{ minHeight: '40px', margin: '15px 0' }}>
          <Col md="8" sm="12" className="pb-2">
            <FaStar onClick={() => setShowNegative(!showNegative)} style={{ height: '1.25em', width: '1.25em', cursor: 'pointer' }} />
          </Col>
          <Col md="4" sm="12" className="text-end" style={{ minWidth: '195px' }}>
            <button style={{ width: 'max-content', minWidth: '150px' }} className="generate-btn" onClick={handleGenerate}>
              Tạo {actionType > 2 ? 'video' : 'ảnh'} <BoraCredit value={actionType > 2 ? 100 : 20} />
            </button>
          </Col>
        </Row>
      </div>

      {/* Toggle hiển thị */}
      <div className="generation-panel-toggle" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '8px' }}>
        <button title="Hiển thị dạng thẻ" onClick={() => setCurrentDisplayType('card')}
          style={{ marginRight: '8px', padding: '8px 16px', backgroundColor: currentDisplayType === 'card' ? '#007bff' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
          <FaTh />
        </button>
        <button title="Hiển thị dạng bảng" onClick={() => setCurrentDisplayType('table')}
          style={{ padding: '8px 16px', backgroundColor: currentDisplayType === 'table' ? '#007bff' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
          <FaTable />
        </button>
      </div>

      <TaskList tasks={tasks} setSelectedTask={setSelectedTask} displayType={currentDisplayType} actionButtons={actionTaskButtons} />
      {selectedTask && <TaskDetailModal taskId={selectedTask.taskId} setSelectedTask={setSelectedTask} />}
    </div>
  );
}

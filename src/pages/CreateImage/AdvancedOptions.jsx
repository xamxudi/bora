import React, { useState, useEffect }  from 'react';
import './AdvancedOptions.css';
import { Row, Col, Form } from 'react-bootstrap';
import { useUIMode } from "../../contexts/UIModeContext";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function AdvancedOptions({
  steps, setSteps,
  cfg, setCfg,
  seed, setSeed,
  width, setWidth,
  height, setHeight,
  samplingMethod, setSamplingMethod
}) {
  const [selectedRatio, setSelectedRatio] = React.useState("portrait");
  const aspectRatio = React.useMemo(() => {
    if (selectedRatio === "custom") return "custom";
    if (width === 768 && height === 1024) return "portrait";
    if (width === 1024 && height === 768) return "landscape";
    if (width === 1024 && height === 1024) return "square";
    return "custom";
  }, [selectedRatio, width, height]);
  const [isOpen, setIsOpen] = useState(false);
  const { uiMode } = useUIMode();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [window.innerWidth]);

  const handleAspectRatio = (ratio) => {
    setSelectedRatio(ratio);
    switch (ratio) {
      case 'portrait':
        setWidth(768);
        setHeight(1024);
        break;
      case 'landscape':
        setWidth(1024);
        setHeight(768);
        break;
      case 'square':
        setWidth(1024);
        setHeight(1024);
        break;
      default:
        break;
    }
  };
  return (
    <div className="advanced-options">
      <div className="advanced-header">
        <h2 className="panel-title">Cài đặt</h2>
        <button
          type="button"
          className="btn toggle-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiChevronUp /> : <FiChevronDown />}
        </button>
      </div>

      {isOpen && (
        <div className="advanced-body">
          {/* Aspect Ratio */}
          <div className="section">
            <h3 className="section-title">Tỷ lệ khung hình</h3>
            <div className="ratio-grid">
              {[
                { key: 'portrait', label: 'Chân dung', dim: '768×1024' },
                { key: 'landscape', label: 'Quang cảnh', dim: '1024×768' },
                { key: 'square', label: 'Vuông', dim: '1024×1024' },
                { key: 'custom', label: 'Tùy chỉnh', dim: '' }
              ].map(({ key, label, dim }) => (
                <button
                  key={key}
                  className={`ratio-btn ${aspectRatio === key ? 'active' : ''}`}
                  onClick={() => handleAspectRatio(key)}
                >
                  {label}
                  {dim && <span className="dimension">{dim}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Dimension */}
          <Row>
            <Col>
              <Form.Group className="mb-3" controlId="width">
                <Form.Label>Chiều rộng</Form.Label>
                <Form.Control
                  type="number"
                  value={width}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val > 1024) val = 1024;
                    if (val < 1) val = 1;
                    setWidth(val);
                  }}
                  disabled={aspectRatio !== 'custom'}
                  min="1"
                  max="1024"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className="mb-3" controlId="height">
                <Form.Label>Chiều cao</Form.Label>
                <Form.Control
                  type="number"
                  value={height}
                  onChange={(e) => {
                    let val = Number(e.target.value);
                    if (val > 1024) val = 1024;
                    if (val < 1) val = 1;
                    setHeight(val);
                  }}
                  disabled={aspectRatio !== 'custom'}
                  min="1"
                  max="1024"
                />
              </Form.Group>
            </Col>
          </Row>

          {/* Các tuỳ chọn nâng cao chỉ hiện khi uiMode ở "advanced" */}
          {uiMode === "advanced" && (
            <>
              {/* CFG */}
              <Form.Group className="mb-3" controlId="cfg">
                <Form.Label>CFG</Form.Label>
                <Form.Control
                  type="number"
                  value={cfg}
                  onChange={(e) => setCfg(Number(e.target.value))}
                />
              </Form.Group>

              {/* Sampling Options */}
              <div className="section">
                <div className="input-group">
                  <label>Sampling Method</label>
                  <select
                    value={samplingMethod}
                    onChange={(e) => setSamplingMethod(e.target.value)}
                  >
                    <option value="euler">Euler</option>
                    <option value="dpmpp_2m">DPM++ 2M</option>
                    <option value="ddim">DDIM</option>
                    <option value="lms">PLMS</option>
                  </select>
                </div>

                <Form.Group className="mb-3" controlId="steps">
                  <Form.Label>Sampling Steps</Form.Label>
                  <Form.Control
                    type="number"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    min="1"
                    max="100"
                  />
                </Form.Group>
              </div>

              {/* Seed */}
              <div className="input-group">
                <label>Seed</label>
                <input
                  type="text"
                  value={seed}
                  onChange={(e) => setSeed(e.target.value)}
                  placeholder="Để trống cho ngẫu nhiên"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

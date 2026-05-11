import React from 'react';
import { Row, Col, Table } from 'react-bootstrap';
import "./TaskContainer.css";
// Không cần import FaDownload, FaTrash, FaImage, FaVideo ở đây nữa

const getMediaType = (url) => {
    if (!url) return null;
    const lowerCaseUrl = url.toLowerCase();
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.tiff'];
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi'];
    const fileExtension = lowerCaseUrl.substring(lowerCaseUrl.lastIndexOf('.'));
    if (imageExtensions.includes(fileExtension)) return 'image';
    if (videoExtensions.includes(fileExtension)) return 'video';
    return null;
};

// Cập nhật props của TaskList
const TaskList = ({
    tasks,
    setSelectedTask,
    displayType = 'card',
    actionButtons = [] // Prop mới: một mảng các hàm render nút
}) => {
    if (!tasks || tasks.length === 0) {
        return <p style={{ color: '#ccc', textAlign: 'center', marginTop: '20px' }}>Không có công việc nào để hiển thị.</p>;
    }
    
    const sortedTasks = [...tasks].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
    });

    // --- Render theo dạng bảng (Table) ---
    const renderTable = () => (
        <Table striped bordered hover variant="dark" responsive className="mt-4">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Thời gian tạo</th>
                    <th>Trạng thái</th>
                    <th>Xem trước Output</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                {sortedTasks.map((task) => {
                    const mediaType = getMediaType(task.outputUrl);
                    return (
                        <tr
                            key={task.taskId}
                            onClick={() => setSelectedTask(task)}
                            style={{ cursor: task.outputUrl ? 'pointer' : 'default' }}
                        >
                            <td>{task.taskId.slice(0, 8)}...</td>
                            <td>{new Date(task.createdAt).toLocaleString()}</td>
                            <td>{task.status}</td>
                            <td>                                
                                {task.outputUrl ? (
                                    <>
                                        {mediaType === 'image' && (
                                            <img
                                                src={task.outputUrl}
                                                alt="Ảnh đã tạo"
                                                style={{ width: '80px', height: 'auto', borderRadius: '4px' }}
                                                onError={(e) => {
                                                    // Khi ảnh lỗi, chuyển sang ảnh mặc định
                                                    e.target.src = `${process.env.PUBLIC_URL}/bora-logo-with-text.png`;
                                                    e.target.alt = "Ảnh không tải được";
                                                    // Đảm bảo ảnh mặc định vẫn hiển thị đúng
                                                    e.target.style.objectFit = 'contain';
                                                }}
                                            />
                                        )}
                                        {mediaType === 'video' && (
                                            <video
                                                src={task.outputUrl}
                                                alt="Video đã tạo"
                                                controls
                                                muted
                                                loop
                                                style={{ width: '80px', height: 'auto', borderRadius: '4px' }}
                                                onError={(e) => {
                                                    // Khi video lỗi, chuyển sang hiển thị ảnh mặc định
                                                    // Đây là một chút thủ thuật: thay thế video bằng một ảnh lỗi
                                                    e.target.parentNode.innerHTML = `<img src="${process.env.PUBLIC_URL}/bora-logo-with-text.png" alt="Video không tải được" style="width: 100%; height: auto; object-fit: contain; border-radius: 4px;" />`;
                                                }}
                                            >
                                                Trình duyệt của bạn không hỗ trợ thẻ video.
                                            </video>
                                        )}
                                        {mediaType === null && (
                                            <img
                                                src={`${process.env.PUBLIC_URL}/bora-logo-with-text.png`} // Sử dụng process.env.PUBLIC_URL
                                                alt="Ảnh đang được tạo"
                                                style={{ width: '80px', height: 'auto', borderRadius: '4px', objectFit: 'contain' }}
                                            />
                                        )}
                                    </>
                                ) : (
                                    <img
                                        src={`${process.env.PUBLIC_URL}/bora-logo-with-text.png`} // Sử dụng process.env.PUBLIC_URL
                                        alt="Ảnh đang được tạo"
                                        style={{ width: '80px', height: 'auto', borderRadius: '4px', objectFit: 'contain' }}
                                    />
                                )}
                            </td>
                            <td>
                                <div style={{ justifyContent: 'center' }} onClick={(e) => e.stopPropagation()}>
                                    {/* Render tất cả các nút hành động từ mảng actionButtons */}
                                    {actionButtons.map((renderButtonFn, index) => (
                                        // Đảm bảo truyền key khi render trong map
                                        <React.Fragment key={index}>
                                            {renderButtonFn(task)}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </td>
                        </tr>
                    )}
                )}
            </tbody>
        </Table>
    );

    // --- Render theo dạng thẻ (Card/Row-Col) ---
    const renderCards = () => (
        <Row style={{ gap: '12px', paddingTop: "12px" }}>
            {sortedTasks.map((task) => {
                const mediaType = getMediaType(task.outputUrl);
                return (
                    <Col
                        xs="12" sm="6" md="4" lg="3" xl="2"
                        key={task.taskId}
                        className="task-item"
                        style={{
                            minWidth: "180px", maxWidth: "250px",
                            backgroundColor: '#1e1e1e',
                            padding: '10px', borderRadius: '8px', border: '1px solid #333',
                            cursor: task.outputUrl ? 'pointer' : 'default',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        }}
                        onClick={() => setSelectedTask(task)}
                    >
                        <div
                            style={{ display: "flex", justifyContent: "flex-end", marginBottom: "8px" }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="dropdown" style={{ position: "relative" }}>
                                <button
                                    style={{
                                        background: "none", border: "none", color: "#ccc",
                                        fontSize: "20px", cursor: "pointer", position: "absolute",
                                        right: "0", top: "-5px",
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const menu = e.currentTarget.nextSibling;
                                        menu.style.display = menu.style.display === "block" ? "none" : "block";
                                    }}
                                >
                                    ⋯
                                </button>
                                <div
                                    style={{
                                        padding: "8px 15px",
                                        display: "none", position: "absolute",
                                        top: "25px", right: "0",
                                        backgroundColor: "#333", borderRadius: "6px",
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.4)", zIndex: 9999,
                                        minWidth: '150px', overflow: 'hidden',
                                    }}
                                    onMouseLeave={(e) => { e.currentTarget.style.display = "none"; }}
                                >
                                    {/* Render tất cả các nút hành động từ mảng actionButtons */}
                                    {actionButtons.map((renderButtonFn, index) => (
                                        <div
                                            key={index} // Key cho div bọc
                                            onClick={(e) => {
                                                // Đóng dropdown sau khi click vào nút
                                                e.stopPropagation();
                                                e.currentTarget.parentNode.style.display = "none";
                                            }}
                                            // Thêm styles cho các item trong dropdown menu
                                            style={{
                                                color: "#fff",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                whiteSpace: "nowrap",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                transition: 'background-color 0.2s ease',
                                            }}
                                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#555'}
                                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#333'}
                                        >
                                            {renderButtonFn(task)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {/* Phần hiển thị output media */}
                        {task.outputUrl ? (
                            <div style={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                {mediaType === 'image' && (
                                    <img
                                        src={task.outputUrl}
                                        alt="Ảnh đã tạo"
                                        style={{ width: '100%', height: 'auto', borderRadius: '4px', objectFit: 'contain' }}
                                        onError={(e) => {
                                            // Khi ảnh lỗi, chuyển sang ảnh mặc định
                                            e.target.src = `${process.env.PUBLIC_URL}/bora-logo-with-text.png`;
                                            e.target.alt = "Ảnh không tải được";
                                            // Đảm bảo ảnh mặc định vẫn hiển thị đúng
                                            e.target.style.objectFit = 'contain';
                                        }}
                                    />
                                )}
                                {mediaType === 'video' && (
                                    <video
                                        src={task.outputUrl}
                                        alt="Video đã tạo"
                                        controls muted loop
                                        style={{ width: '100%', height: 'auto', borderRadius: '4px', objectFit: 'contain' }}
                                        onError={(e) => {
                                            // Khi video lỗi, chuyển sang hiển thị ảnh mặc định
                                            // Đây là một chút thủ thuật: thay thế video bằng một ảnh lỗi
                                            e.target.parentNode.innerHTML = `<img src="${process.env.PUBLIC_URL}/bora-logo-with-text.png" alt="Video không tải được" style="width: 100%; height: auto; object-fit: contain; border-radius: 4px;" />`;
                                        }}
                                    >
                                        Trình duyệt của bạn không hỗ trợ thẻ video.
                                    </video>
                                )}
                                {mediaType === null && (
                                <img
                                        src={`${process.env.PUBLIC_URL}/bora-logo-with-text.png`} // Sử dụng process.env.PUBLIC_URL
                                        alt="Ảnh đang được tạo"
                                        style={{ width: '100%', height: 'auto', borderRadius: '4px', objectFit: 'contain' }}
                                    />
                                )}
                            </div>
                        ) : (
                        <img
                                src={`${process.env.PUBLIC_URL}/bora-logo-with-text.png`} // Sử dụng process.env.PUBLIC_URL
                                alt="Ảnh đang được tạo"
                                style={{ width: '100%', height: 'auto', borderRadius: '4px', objectFit: 'contain' }}
                            />
                        )}

                        {/* Thông tin task */}
                        <div style={{ marginTop: 'auto', paddingTop: '8px', borderTop: '1px solid #444' }}>
                            <p style={{ margin: 0, fontSize: '12px', color: '#eee' }}>
                                <strong>ID: </strong> {task.taskId.slice(0, 8)}...
                                <br />
                                <strong>Trạng thái: </strong> 
                                <span style={{ 
                                    color: task.status === 'Completed' ? '#28a745' : task.status === 'Failed' ?  '#dc3545' : '#ffc107'
                                }}>{task.status}</span>
                                <br />
                                <span style={{ fontSize: '10px', color: '#999' }}>{new Date(task.createdAt).toLocaleString()}</span>
                            </p>
                        </div>
                    </Col>
                    )
            })}
        </Row>
    );

    return displayType === 'table' ? renderTable() : renderCards();
};

export default TaskList;
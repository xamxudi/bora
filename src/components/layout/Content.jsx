import React, { useState, useEffect } from "react";
import { APIService } from "../../services/ApiService";
import "./Content.css";

export default function Content() {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    APIService.loras
      .getAll()
      .then((data) => {
        const mapped = data.map((item) => ({
          id: item.id,
          title: item.name,
          image: item.imageUrl || "https://via.placeholder.com/150",
          views: item.isActive ? "Active" : "Inactive",
          author: item.category ?? "Unknown",
        }));
        setModels(mapped);
      })
      .catch((err) => {
        console.error("Error loading loras:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const workflows = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    title: `Workflow ${i + 1}`,
    image: "https://via.placeholder.com/150",
    nodes: Math.floor(Math.random() * 10) + 1,
  }));

  return (
    <div className="content-container">
      {/* Models */}
      <section className="section">
        <div className="section-header">LoRA Models</div>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="card-grid">
            {models.map((m) => (
              <div className="card" key={m.id}>
                <img src={m.image} alt={m.title} />
                <div className="card-info">
                  <div className="title">{m.title}</div>
                  <div className="meta">
                    <span>{m.views}</span>
                    <span>{m.author}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <button className="view-all">View All LoRAs</button>
      </section>

      {/* Workflows */}
      <section className="section">
        <div className="section-header">Workflows</div>
        <div className="card-grid">
          {workflows.map((w) => (
            <div className="card" key={w.id}>
              <img src={w.image} alt={w.title} />
              <div className="card-info">
                <div className="title">{w.title}</div>
                <div className="meta">
                  <span>{w.nodes} Nodes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="view-all">View All Workflows</button>
      </section>
    </div>
  );
}

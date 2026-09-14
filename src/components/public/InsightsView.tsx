import React, { useState } from 'react';
import { db } from '../../services/db';
import { Article } from '../../types';
import { Button } from '../ui/Buttons';
import { BookOpen, Calendar, Clock, User, ArrowLeft, ArrowRight, Share2, Tag } from 'lucide-react';
import { useToast } from '../ui/Toast';
import { resolveItemTypography } from '../admin/ItemTypographyControls';

interface InsightsViewProps {
  slug?: string;
  onNavigate: (path: string) => void;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ slug, onNavigate }) => {
  const articles = db.getArticles(false);

  if (slug) {
    const article = db.getArticleBySlug(slug);
    if (!article) {
      return (
        <div className="py-24 text-center space-y-4">
          <h2 className="font-cinzel text-xl text-[#f4e6d0]">Article Not Found</h2>
          <Button variant="gold-outline" size="sm" onClick={() => onNavigate('/insights')}>
            Back to Insights
          </Button>
        </div>
      );
    }
    return <ArticleReadingDetail article={article} onNavigate={onNavigate} />;
  }

  return <InsightsDirectory articles={articles} onNavigate={onNavigate} />;
};

const InsightsDirectory: React.FC<{
  articles: Article[];
  onNavigate: (path: string) => void;
}> = ({ articles, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', ...Array.from(new Set(articles.map((a) => a.category)))];

  const filtered = articles.filter(
    (a) => selectedCategory === 'All' || a.category === selectedCategory
  );

  return (
    <div className="bg-[#0d0d11] min-h-screen py-16 sm:py-24 text-left">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span className="font-cinzel text-xs font-semibold tracking-[0.25em] text-[#c59b63] uppercase">
            Scholarly Commentary &amp; Briefings
          </span>
          <h1 className="font-cormorant text-4xl sm:text-6xl font-light text-[#f7f4ee]">
            Legal Insights &amp; Jurisprudence
          </h1>
          <p className="text-sm text-[#a8a199] leading-relaxed">
            Analytical assessments of newly promulgated Philippine Supreme Court doctrines, SEC regulatory memorandum circulars, and cross-border commercial jurisprudence.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 border-b border-[#1c1c24]">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`font-cinzel text-xs uppercase tracking-wider px-4 py-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#c59b63] text-[#0d0d11] font-semibold'
                  : 'text-[#a8a199] hover:text-[#f7f4ee] hover:bg-[#181820]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((art) => {
            const titleTypo = resolveItemTypography(art.typography, 'title', {
              fontFamily: 'font-cormorant',
              fontSize: 'text-2xl',
              color: 'text-[#f7f4ee]',
            });
            const excerptTypo = resolveItemTypography(art.typography, 'desc', {
              fontFamily: 'font-sans',
              fontSize: 'text-xs',
              color: 'text-[#a8a199]',
            });

            return (
              <article
                key={art.id}
                onClick={() => onNavigate(`/insights/${art.slug}`)}
                className="group bg-[#121217] border border-[#22222d] hover:border-[#c59b63]/60 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div className="p-7 space-y-4">
                  <div className="flex items-center justify-between text-[11px] text-[#8e877e]">
                    <span className="font-cinzel uppercase tracking-wider text-[#c59b63]">
                      {art.category}
                    </span>
                    <span>{art.readTime}</span>
                  </div>

                  <h3
                    style={titleTypo.customStyle}
                    className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} font-light group-hover:text-[#f4e6d0] leading-snug`}
                  >
                    {art.title}
                  </h3>

                  <p
                    style={excerptTypo.customStyle}
                    className={`${excerptTypo.fontClass} ${excerptTypo.sizeClass} ${excerptTypo.colorClass} leading-relaxed line-clamp-3`}
                  >
                    {art.excerpt}
                  </p>

                  {art.tags && art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {art.tags.slice(0, 3).map((tag, i) => (
                        <span
                          key={i}
                          className="text-[9px] font-mono text-[#8a8378] bg-[#1a1a23] px-2 py-0.5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-7 pt-4 border-t border-[#1c1c24] flex items-center justify-between text-xs text-[#6e6860]">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#c59b63]" />
                    <span className="text-[11px] text-[#a8a199]">{art.authorName}</span>
                  </div>
                  <span className="font-cinzel text-[10px] uppercase text-[#c59b63] tracking-wider group-hover:translate-x-1 transition-transform">
                    Read Note →
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const ArticleReadingDetail: React.FC<{
  article: Article;
  onNavigate: (path: string) => void;
}> = ({ article, onNavigate }) => {
  const toast = useToast();

  const titleTypo = resolveItemTypography(article.typography, 'title', {
    fontFamily: 'font-cormorant',
    fontSize: 'text-3xl sm:text-5xl lg:text-6xl',
    color: 'text-[#f7f4ee]',
  });
  const excerptTypo = resolveItemTypography(article.typography, 'desc', {
    fontFamily: 'font-sans',
    fontSize: 'text-base sm:text-lg',
    color: 'text-[#b8b0a5]',
  });
  const bodyTypo = resolveItemTypography(article.typography, 'body', {
    fontFamily: 'font-sans',
    fontSize: 'text-sm sm:text-base',
    color: 'text-[#cfc7bc]',
  });

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Link Copied', 'Briefing URL has been copied to your clipboard.');
  };

  return (
    <div className="bg-[#0d0d11] min-h-screen py-12 sm:py-20 text-left">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 space-y-10">
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('/insights')}
            className="inline-flex items-center gap-2 text-xs font-cinzel uppercase tracking-wider text-[#c59b63] hover:text-[#f7f4ee] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Legal Insights</span>
          </button>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-[#a8a199] hover:text-[#c59b63] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share Note</span>
          </button>
        </div>

        {/* Header Block */}
        <header className="border-b border-[#22222d] pb-8 space-y-4">
          <div className="flex items-center gap-3">
            <span className="font-cinzel text-xs font-semibold tracking-[0.2em] text-[#c59b63] uppercase">
              {article.category}
            </span>
            <span className="text-[#3a3a46]">·</span>
            <span className="text-xs text-[#8e877e]">{article.readTime}</span>
          </div>

          <h1
            style={titleTypo.customStyle}
            className={`${titleTypo.fontClass} ${titleTypo.sizeClass} ${titleTypo.colorClass} font-light leading-tight`}
          >
            {article.title}
          </h1>

          <p
            style={excerptTypo.customStyle}
            className={`${excerptTypo.fontClass} ${excerptTypo.sizeClass} ${excerptTypo.colorClass} font-light leading-relaxed italic`}
          >
            "{article.excerpt}"
          </p>

          <div className="pt-4 flex items-center justify-between text-xs text-[#a8a199]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1a1a24] border border-[#c59b63]/50 flex items-center justify-center font-cinzel text-xs text-[#c59b63]">
                LP
              </div>
              <div>
                <p className="text-[#f7f4ee] font-medium">{article.authorName}</p>
                <p className="text-[10px] text-[#7e776e]">Lalusis &amp; Partners</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[#8e877e]">
              <Calendar className="w-3.5 h-3.5" />
              <span>{new Date(article.publishedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</span>
            </div>
          </div>
        </header>

        {/* Main Editorial Content */}
        <div
          style={bodyTypo.customStyle}
          className={`${bodyTypo.fontClass} ${bodyTypo.sizeClass} ${bodyTypo.colorClass} prose prose-invert max-w-none leading-relaxed space-y-6`}
        >
          {article.content.split('\n\n').map((para, i) => {
            if (para.startsWith('## ')) {
              return (
                <h2
                  key={i}
                  className="font-cinzel text-xl sm:text-2xl font-medium text-[#f4e6d0] pt-6 pb-2 border-b border-[#22222d]"
                >
                  {para.replace('## ', '')}
                </h2>
              );
            }
            if (para.startsWith('### ')) {
              return (
                <h3 key={i} className="font-cinzel text-lg font-medium text-[#c59b63] pt-4">
                  {para.replace('### ', '')}
                </h3>
              );
            }
            if (para.startsWith('- ')) {
              return (
                <ul key={i} className="list-disc pl-6 space-y-2 text-[#b8b0a5]">
                  {para.split('\n').map((li, lIdx) => (
                    <li key={lIdx}>{li.replace(/^- /, '')}</li>
                  ))}
                </ul>
              );
            }
            return <p key={i}>{para}</p>;
          })}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-6 border-t border-[#22222d] flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-[#c59b63]" />
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs font-mono text-[#a8a199] bg-[#14141a] border border-[#22222d] px-2.5 py-1"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Legal Disclaimer Box */}
        <div className="bg-[#121217] border border-[#262633] p-6 text-xs text-[#7e776e] leading-relaxed">
          <p>
            <strong className="text-[#a8a199] font-cinzel uppercase">Editorial Notice:</strong> This article is authored for the informational instruction of clients and academic colleagues. It does not replace individualized counsel concerning specific legal questions.
          </p>
        </div>

        {/* CTA */}
        <div className="bg-[#171720] border border-[#c59b63]/30 p-8 text-center space-y-4">
          <h4 className="font-cormorant text-2xl text-[#f7f4ee]">
            Require Counsel Regarding This Doctrine?
          </h4>
          <p className="text-xs text-[#a8a199] max-w-md mx-auto">
            Discuss your company’s exposure or transactional structure with our corporate and litigation partners.
          </p>
          <Button variant="primary" size="md" onClick={() => onNavigate('/consultation')}>
            Initiate Case Inquiry
          </Button>
        </div>
      </div>
    </div>
  );
};
